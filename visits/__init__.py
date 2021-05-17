from flask_restful import Resource
from clickhouse_driver import connect
from datetime import datetime
from marshmallow import ValidationError
from .schema import VisitSchema
from flask import request
import json


conn = connect('clickhouse://localhost')
visit_cursor = conn.cursor()

class Visits(Resource):
    def post(self):
        visit_info = json.loads(request.data)
        try:
            visit_info = VisitSchema().load(visit_info)

            #преобразование bool -> int
            cookieAgree = visit_info['cookieAgree']
            visit_info['cookieAgree'] = int(cookieAgree == True)

            #получение индекса браузера в листе для сохранения в базе
            browser = visit_info['browser']
            visit_info['browser'] = browsersList.index(browser)

            visit_info['createDate'] = visit_info['createDate'] // 1000
            print(visit_info)
            visit_cursor.executemany('INSERT INTO smartyPants.visits VALUES',
                                [[
                                visit_info['uniqueID'], visit_info['visitID'],
                                visit_info['screenHeight'], visit_info['screenWidth'],
                                visit_info['cookieAgree'], visit_info['browser'],
                                visit_info['createDate'],
                                datetime.fromtimestamp(visit_info['createDate'])
                                ]])
            with open ('./visits/data.txt', 'a+') as file:
                file.write(json.dumps(visit_info)+'\n')
                file.close()
        except ValidationError as err:
            print(err.messages)
        return {} , 200

browsersList = [
                'Safari', 'Firefox', 'IE PC', 'Google Chrome',
                'Yandex Browser', 'Opera PC', 'Konqueror', 'Debian Iceweasel',
                'SeaMonkey', 'MS Edge (Old)', 'MS Edge (Chrome Engine)',
                #мобильные браузеры
                'UC Browser', 'Opera Mini', 'Apple iOS', 'Blackberry Device',
                'IE Mobile', 'Android Device', 'Samsung Internet'
                ]
