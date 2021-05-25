from datetime import datetime
import json

from flask import request, make_response, jsonify
from flask_restful import Resource
from marshmallow import ValidationError
from clickhouse_driver import connect

from .schema import SurveySchema, GetSchema

conn = connect('clickhouse://localhost')
survey_cursor = conn.cursor()
select_cursor = conn.cursor()

class Surveys(Resource):
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

        if 'surveyID' not in params or 'pathName' not in params:
            err_response = make_response(
                {'message': 'Not enough parameters'},
                400
            )
            self.set_access_headers(err_response)
            return err_response

        select_cursor.execute(
            'SELECT  q1, count() AS q1Count '
            'FROM smartyPants.surveys '
            'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                    'pathName = %(pathName)s AND surveyID = %(id)s'
            'GROUP BY q1',
            {
                'start': params['start'],
                'end': params['end'],
                'pathName': params['pathName'],
                'id': params['surveyID']
            }
        )
        dbResult = select_cursor.fetchall()

        result = {'q1': {}}
        for row in dbResult:
            result['q1'][row[0]] = row[1]


        select_cursor.execute(
            'SELECT  q2, count() AS q2Count '
            'FROM smartyPants.surveys '
            'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                    'pathName = %(pathName)s AND surveyID = %(id)s '
            'GROUP BY q2',
            {
                'start': params['start'],
                'end': params['end'],
                'pathName': params['pathName'],
                'id': params['surveyID']
            }
        )
        dbResult = select_cursor.fetchall()

        result['q2'] = {}
        for row in dbResult:
            result['q2'][row[0]] = row[1]

        select_cursor.execute(
            'SELECT  q3, count() AS q3Count '
            'FROM smartyPants.surveys '
            'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                    'pathName = %(pathName)s AND surveyID = %(id)s'
            'GROUP BY q3',
            {
                'start': params['start'],
                'end': params['end'],
                'pathName': params['pathName'],
                'id': params['surveyID']
            }
        )
        dbResult = select_cursor.fetchall()

        result['q3'] = {}
        for row in dbResult:
            result['q3'][row[0]] = row[1]

        select_cursor.execute(
            'SELECT  q4 '
            'FROM smartyPants.surveys '
            'WHERE  surveyDate BETWEEN %(start)s  AND %(end)s  AND '
                    'pathName = %(pathName)s AND surveyID = %(id)s AND '
                    'q4 != %(empty)s'
            'LIMIT 5',
            {
                'start': params['start'],
                'end': params['end'],
                'pathName': params['pathName'],
                'id': params['surveyID'],
                'empty': ''
            }
        )
        dbResult = select_cursor.fetchall()

        result['q4'] = []
        for row in dbResult:
            result['q4'].append(row[0])

        response = make_response(jsonify(result),200)
        self.set_access_headers(response)
        return response

    def set_access_headers(self, response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")

    def post(self):
        survey_data = request.form.to_dict()

        try:
            survey_data = SurveySchema().load(survey_data)
        except ValidationError as err:
            print (err.messages)
            response = make_response(err.messages, 400)
            return response

        cur_date = datetime.today();
        survey_data['surveyDate'] = cur_date.strftime("%Y-%m-%d")
        survey_data['surveyTime'] = cur_date.strftime("%Y-%m-%d %H:%M:%S")
        print (survey_data)

        survey_cursor.executemany(
            'INSERT INTO smartyPants.surveys VALUES',
            [[
                survey_data['uniqueID'], survey_data['surveyID'],
                survey_data['page'], survey_data['q1'],
                survey_data['q2'], survey_data['q3'],
                survey_data['q4'], cur_date, cur_date
            ]]
        )

        json_string = json.dumps(survey_data, ensure_ascii=False).encode('utf8')
        with open ('./surveys/data.txt', 'a+') as file:
            file.write(json_string.decode()+'\n')
        file.close()

        response = make_response({'message': 'ok'}, 200)
        response.set_access_headers(response)
        return response
