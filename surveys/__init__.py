from flask_restful import Resource
from clickhouse_driver import connect
from datetime import datetime
from marshmallow import ValidationError
from .schema import SurveySchema
from flask import request
import json

conn = connect('clickhouse://localhost')
survey_cursor = conn.cursor()
select_cursor = conn.cursor()
class Surveys(Resource):
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
        select_cursor.execute('SELECT  q1, count() AS q1Count '
                'FROM smartyPants.surveys '
                'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                        'pathName = %(pathName)s AND surveyID = %(id)s'
                'GROUP BY q1 WITH TOTALS',
                {'start': params['start'],
                 'end': params['end'],
                 'pathName': params['pathName'],
                 'id': params['surveyID']
                 })
        dbResult = select_cursor.fetchall()
        print(dbResult)
        response = { 'q1': {} }
        for row in dbResult:
            response['q1'][row[0]] = row[1]
        print(response)
        select_cursor.execute('SELECT  q2, count() AS q2Count '
                'FROM smartyPants.surveys '
                'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                        'pathName = %(pathName)s AND surveyID = %(id)s'
                'GROUP BY q2',
                {'start': params['start'],
                 'end': params['end'],
                 'pathName': params['pathName'],
                 'id': params['surveyID']
                 })
        dbResult = select_cursor.fetchall()
        response['q2'] = {}
        for row in dbResult:
            response['q2'][row[0]] = row[1]
        select_cursor.execute('SELECT  q3, count() AS q3Count '
                'FROM smartyPants.surveys '
                'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                        'pathName = %(pathName)s AND surveyID = %(id)s'
                'GROUP BY q3',
                {'start': params['start'],
                 'end': params['end'],
                 'pathName': params['pathName'],
                 'id': params['surveyID']
                 })
        dbResult = select_cursor.fetchall()
        response['q3'] = {}
        for row in dbResult:
            response['q3'][row[0]] = row[1]
        select_cursor.execute('SELECT  q4 '
                'FROM smartyPants.surveys '
                'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                        'pathName = %(pathName)s AND surveyID = %(id)s AND '
                        'q4 != %(empty)s'
                'LIMIT 5',
                {'start': params['start'],
                 'end': params['end'],
                 'pathName': params['pathName'],
                 'id': params['surveyID'],
                 'empty': ''
                 })
        dbResult = select_cursor.fetchall()
        response['q4'] = []
        for row in dbResult:
            response['q4'].append(row[0])
        #response = {'visits': dbResult[0], 'bouncedVisits': dbResult[1], 'bounceRate': dbResult[2]}
        return response, 200
    def post(self):
        survey_data = request.form.to_dict()
        try:
            survey_data = SurveySchema().load(survey_data)

            #for printing russian symbols
            currentDate = datetime.today();
            survey_data['surveyDate'] = currentDate.strftime("%Y-%m-%d")
            survey_data['surveyTime'] = currentDate.strftime("%Y-%m-%d %H:%M:%S")
            print (survey_data)

            survey_cursor.executemany('INSERT INTO smartyPants.surveys VALUES',
                              [[
                                survey_data['uniqueID'], survey_data['surveyID'],
                                survey_data['page'], survey_data['q1'],
                                survey_data['q2'], survey_data['q3'],
                                survey_data['q4'], currentDate, currentDate
                              ]])

            json_string = json.dumps(survey_data, ensure_ascii=False).encode('utf8')
            with open ('./surveys/data.txt', 'a+') as file:
                file.write(json_string.decode()+'\n')
            file.close()
            return {} , 200
        except ValidationError as err:
            print (err.messages)
