from flask_restful import Resource
from clickhouse_driver import connect
from datetime import datetime
from marshmallow import ValidationError
from .schema import FileSchema
from flask import request
import json

conn = connect('clickhouse://localhost')
file_cursor = conn.cursor()
select_cursor = conn.cursor()
class Files(Resource):
    def get(self):
        req_info = request.args.to_dict();
        print(req_info['type'])
        #TODO check for get and post functions!!!
        #checking if a method exists
        if hasattr(self, req_info['type']) and callable(getattr(self, req_info['type'])):
            func = getattr(self, req_info['type'])
            return func(req_info)
        else:
            return {'message': 'Not found'}, 404
    def common_info(self, params):
        #TODO: check input params
        #TODO: errors processing
        select_cursor.execute('SELECT count() AS downloadedFiles '
                'FROM smartyPants.files '
                'WHERE loadDate BETWEEN %(start)s  AND %(end)s  AND '
                        'discipline = %(disc)s',
                {'start': params['start'],
                 'end': params['end'],
                 'disc': params['disc']
                 })
        dbResult = select_cursor.fetchone()
        return { 'downloadedFiles': dbResult[0] }, 200
    def disc_info(self, params):
        #TODO: check input params
        #TODO: errors processing
        select_cursor.execute('SELECT toString(loadDate), count() AS downloads '
                'FROM smartyPants.files '
                'WHERE loadDate BETWEEN %(start)s AND %(end)s AND '
                'discipline = %(disc)s'
                'GROUP BY loadDate',
                {'start': params['start'],
                 'end': params['end'],
                 'disc': params['disc']
                 })
        response = {'graph':{}}
        #TODO change logic for fetchall
        while (row := select_cursor.fetchone()):
            response['graph'][row[0]] = row[1]
        
        select_cursor.execute('SELECT fileID, count() AS downloads, '
                'countIf(isArchive = 1) AS archiveCount '
                'FROM smartyPants.files '
                'WHERE loadDate BETWEEN %(start)s AND %(end)s AND '
                'discipline = %(disc)s'
                'GROUP BY fileID '
                'ORDER BY downloads DESC',
                {'start': params['start'],
                 'end': params['end'],
                 'disc': params['disc']
                 })
        response['top'] = []
        #TODO change logic for fetchall
        while (row := select_cursor.fetchone()):
            file = {'fileID': row[0], 'downloads': row[1], 'archive': row[2]}
            response['top'].append(file)
        return response, 200
    def file_info(self, params):
        #TODO: check input params
        #TODO: errors processing
        select_cursor.execute('SELECT userGroup, uniqueID, count() AS downloads '
                'FROM smartyPants.files '
                'WHERE loadDate BETWEEN %(start)s AND %(end)s AND '
                'fileID = %(fileID)s '
                'GROUP BY userGroup, uniqueID WITH ROLLUP',
                {'start': params['start'],
                 'end': params['end'],
                 'fileID': params['fileID']
                 })
        dbResult = select_cursor.fetchall()
        response = { 'detailed': [], 'total': [] }

        for row in dbResult:
        #while (row := select_cursor.fetchone()):
            rowDict = { 'group': row[0], 'ID': row[1], 'count': row[2] }
            if rowDict['ID'] == 0:
                response['total'].append(rowDict)
            else:
                response['detailed'].append(rowDict)
        return response, 200

    def post(self):
        files_info = json.loads(request.data)
        files_list = [];
        if type(files_info) == list:
            files_list = files_info
        else:
            files_list.append(files_info)
        try:
            files_list = FileSchema(many=True).load(files_list)
            files_output = list(map(prepareFilesInfo, files_list))
            print(files_list)
            file_cursor.executemany('INSERT INTO smartyPants.files VALUES',
                                    files_output)
            with open ('./files/data.txt', 'a+') as file:
                file.write(json.dumps(files_list)+'\n')
            file.close()
        except ValidationError as err:
            print(err.messages)
        return {} , 200

def prepareFilesInfo(dict):
    dict['isArchive'] = int(dict['isArchive'] == True)
    dict['downloadDate'] = dict['downloadDate'] // 1000
    return [dict['uniqueID'], dict['visitID'], dict['userGroup'],
            dict['fileID'], dict['isArchive'], dict['downloadDate'],
            datetime.fromtimestamp(dict['downloadDate']),
            dict['discipline'], dict['referrer']]
