from datetime import datetime
import json

from flask import request, make_response, jsonify
from flask_restful import Resource
from marshmallow import ValidationError
from clickhouse_driver import connect

from .schema import PageSchema, GetSchema


conn = connect('clickhouse://localhost')
page_cursor = conn.cursor()
select_cursor = conn.cursor()


class Pages(Resource):
    def get(self):
        #get parameters
        req_info = request.args.to_dict()

        errors = GetSchema().validate(req_info)
        if errors:
            err_response = make_response(errors, 400)
            self.set_access_headers(err_response)
            return err_response

        type = req_info['type']
        #check for get and post and builtIn functions
        if type == 'get' or type == 'post':
            err_response = make_response(
                {'message': 'Not supported method'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        #checking if a method exists - call it
        if hasattr(self, type) and callable(getattr(self, type)):
            func = getattr(self, type)
            return func(req_info)

        err_response = make_response({'message': 'Not found'}, 404)
        self.set_access_headers(err_response)
        return err_response

    def common_info(self, params):
        #TODO: check input params
        #TODO: errors processing
        if 'pathName' not in params:
            err_response = make_response(
                {'message': 'Not enough parameters'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        select_cursor.execute(
            'SELECT  uniq(uniqueID) AS unique, count() AS visits, '
            'countIf(activeTime < 5) AS bouncedVisits, '
            '(100. * bouncedVisits) / visits AS bounceRate '
            'FROM    smartyPants.pages '
            'WHERE   hitDate BETWEEN %(start)s  AND %(end)s  AND '
                     'pathName = %(pathName)s',
            {
                'start': params['start'],
                'end': params['end'],
                'pathName': params['pathName']
            }
        )

        dbResult = select_cursor.fetchone()
        response = make_response(
            jsonify(
                {
                    'unique': dbResult[0],
                    'visits': dbResult[1],
                    'bouncedVisits': dbResult[2],
                    'bounceRate': round(dbResult[3], 2)
                }
            ),
            200
        )
        self.set_access_headers(response)
        return response

    def set_access_headers(self, response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")

    def post(self):
        page_info = json.loads(request.data)

        try:
            page_info = PageSchema().load(page_info)
        except ValidationError as err:
            print(err.messages)
            err_response = make_response(err.messages, 400)
            self.set_access_headers(err_response)
            return err_response

        #get seconds for activeTime
        page_info['activeTime'] = page_info['activeTime'] // 1000
        page_info['hitDate'] = page_info['hitDate'] // 1000
        print(page_info)

        page_cursor.executemany(
            'INSERT INTO smartyPants.pages VALUES',
            [[
                page_info['uniqueID'], page_info['visitID'],
                page_info['pathName'], page_info['loadTime'],
                page_info['activeTime'], page_info['hitDate'],
                datetime.fromtimestamp(page_info['hitDate']),
                page_info['referrer']
            ]]
        )

        with open ('./pages/data.txt', 'a+') as file:
            file.write(json.dumps(page_info)+'\n')
            file.close()

        response = make_response({'message': 'ok'}, 200)
        self.set_access_headers(response)
        return response
