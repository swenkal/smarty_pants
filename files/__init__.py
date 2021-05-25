from datetime import datetime
import json

from flask import request, make_response, jsonify
from flask_restful import Resource
from marshmallow import ValidationError
from clickhouse_driver import connect

from .schema import FileSchema, GetSchema

conn = connect('clickhouse://localhost')
file_cursor = conn.cursor()
select_cursor = conn.cursor()

class Files(Resource):
    def get(self):
        req_info = request.args.to_dict();

        errors = GetSchema().validate(req_info)
        if errors:
            err_response = make_response(errors, 400)
            self.set_access_headers(err_response)
            return err_response

        type = req_info['type']
        if type == 'get' or type == 'post':
            err_response = make_response(
                {'message': 'Not supported method'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        #checking if a method exists
        if hasattr(self, type) and callable(getattr(self, type)):
            func = getattr(self, type)
            return func(req_info)

        err_response = make_response({'message': 'Not found'}, 404)
        self.set_access_headers(err_response)
        return err_response

    def common_info(self, params):

        #check additional param
        if 'disc' not in paramss:
            err_response = make_response(
                {'message': 'Not enough parameters'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        select_cursor.execute(
            'SELECT count() AS downloadedFiles '
            'FROM smartyPants.files '
            'WHERE loadDate BETWEEN %(start)s  AND %(end)s  AND '
                    'discipline = %(disc)s',
            {
                'start': params['start'],
                'end': params['end'],
                'disc': params['disc']
            }
        )
        dbResult = select_cursor.fetchone()

        response = make_response(
            jsonify(
                {
                    'downloads': dbResult[0]
                }
            ),
            200
        )
        self.set_access_headers(response)
        return response

    def disc_info(self, params):

        #check additional param
        if 'disc' not in paramss:
            err_response = make_response(
                {'message': 'Not enough parameters'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        select_cursor.execute(
            'SELECT loadDate, count() AS downloads '
            'FROM smartyPants.files '
            'WHERE loadDate BETWEEN %(start)s AND %(end)s AND '
                   'discipline = %(disc)s '
            'GROUP BY loadDate '
            'ORDER BY loadDate ASC '
            'WITH FILL FROM toDate(%(start)s) TO toDate(%(end)s) STEP 1',
            {
                'start': params['start'],
                'end': params['end'],
                'disc': params['disc']
            }
        )

        result = {'graph':{}}
        #TODO change logic for fetchall
        while (row := select_cursor.fetchone()):
            dateStr = row[0].strftime("%Y-%m-%d")
            result['graph'][dateStr] = row[1]

        select_cursor.execute(
            'SELECT fileID, count() AS downloads, '
            'countIf(isArchive = 1) AS archiveCount '
            'FROM smartyPants.files '
            'WHERE loadDate BETWEEN %(start)s AND %(end)s AND '
                   'discipline = %(disc)s'
            'GROUP BY fileID '
            'ORDER BY downloads DESC',
            {
                'start': params['start'],
                'end': params['end'],
                'disc': params['disc']
            }
        )
        result['top'] = []
        #TODO change logic for fetchall
        while (row := select_cursor.fetchone()):
            file = {
                'fileID': row[0],
                'downloads': row[1],
                'archive': row[2]
            }
            result['top'].append(file)

        response = make_response(jsonify(result),200)
        self.set_access_headers(response)
        return response

    def file_info(self, params):
        #TODO: check input params
        #TODO: errors processing
        if 'fileID' not in params:
            err_response = make_response(
                {'message': 'Not enough parameters'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        select_cursor.execute(
            'SELECT userGroup, uniqueID, count() AS downloads '
            'FROM smartyPants.files '
            'WHERE loadDate BETWEEN %(start)s AND %(end)s AND '
                   'fileID = %(fileID)s '
            'GROUP BY userGroup, uniqueID WITH ROLLUP',
            {
                'start': params['start'],
                'end': params['end'],
                'fileID': params['fileID']
            }
        )
        dbResult = select_cursor.fetchall()

        result = { 'detailed': [], 'total': [] }
        for row in dbResult:
        #while (row := select_cursor.fetchone()):
            rowDict = {
                'group': row[0],
                'ID': row[1],
                'count': row[2]
            }
            if rowDict['ID'] == 0:
                result['total'].append(rowDict)
            else:
                result['detailed'].append(rowDict)

        response = make_response(jsonify(result), 200)
        self.set_access_headers(response)
        return response

    def set_access_headers(self, response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")

    def post(self):
        files_info = json.loads(request.data)
        files_list = [];
        if type(files_info) == list:
            files_list = files_info
        else:
            files_list.append(files_info)
        try:
            files_list = FileSchema(many=True).load(files_list)
        except ValidationError as err:
            print(err.messages)
            err_response = make_response(err.messages, 400)
            self.set_access_headers(err_response)
            return err_response

        files_output = list(map(prepareFilesInfo, files_list))
        print(files_list)

        file_cursor.executemany(
            'INSERT INTO smartyPants.files VALUES',
            files_output
        )

        with open ('./files/data.txt', 'a+') as file:
            file.write(json.dumps(files_list)+'\n')
            file.close()

        response = make_response({'message': 'ok'}, 200)
        response.set_access_headers(response)
        return response

def prepareFilesInfo(dict):
    dict['isArchive'] = int(dict['isArchive'] == True)
    dict['downloadDate'] = dict['downloadDate'] // 1000
    return [dict['uniqueID'], dict['visitID'], dict['userGroup'],
            dict['fileID'], dict['isArchive'], dict['downloadDate'],
            datetime.fromtimestamp(dict['downloadDate']),
            dict['discipline'], dict['referrer']]
