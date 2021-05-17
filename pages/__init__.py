from flask_restful import Resource
from clickhouse_driver import connect
from datetime import datetime
from marshmallow import ValidationError
from .schema import PageSchema
from flask import request
import json

conn = connect('clickhouse://localhost')
page_cursor = conn.cursor()
select_cursor = conn.cursor()

class Pages(Resource):
    def get(self):
        #get parameters
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
        select_cursor.execute('SELECT  count() AS visits, '
                'countIf(activeTime < 5) AS bouncedVisits, '
                '(100. * bouncedVisits) / visits AS bounceRate '
                'FROM    smartyPants.pages '
                'WHERE   hitDate BETWEEN %(start)s  AND %(end)s  AND '
                         'pathName = %(pathName)s',
                #{'start': '2021-05-09', 'end': '2021-05-12', 'disc': '/disciplines/the-newest/'})
                {'start': params['start'], 'end': params['end'], 'pathName': params['pathName']})
        dbResult = select_cursor.fetchone()
        response = {'visits': dbResult[0], 'bouncedVisits': dbResult[1], 'bounceRate': dbResult[2]}
        return response, 200
    def post(self):
        page_info = json.loads(request.data)
        try:
            print(page_info['referrer'])
            page_info = PageSchema().load(page_info)
            #в зависимости от того, как отправляется дата в ClickHouse
            #hitDate = page_info['hitDate']
            #page_info['hitDate'] = aniso8601.parse_datetime(hitDate)

            #get seconds for activeTime
            page_info['activeTime'] = page_info['activeTime'] // 1000
            page_info['hitDate'] = page_info['hitDate'] // 1000
            print(page_info)

            page_cursor.executemany('INSERT INTO smartyPants.pages VALUES',
                              [[
                                page_info['uniqueID'], page_info['visitID'],
                                page_info['pathName'], page_info['loadTime'],
                                page_info['activeTime'], page_info['hitDate'],
                                datetime.fromtimestamp(page_info['hitDate']),
                                page_info['referrer']
                              ]])

            with open ('./pages/data.txt', 'a+') as file:
                file.write(json.dumps(page_info)+'\n')
            file.close()
        except ValidationError as err:
            print(err.messages)
        return {} , 200
