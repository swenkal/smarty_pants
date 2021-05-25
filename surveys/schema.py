from marshmallow import Schema, fields
from marshmallow.validate import Regexp

class SurveySchema(Schema):
    uniqueID = fields.Int(required=True)
    surveyID = fields.Int(required=True)
    page = fields.Str(required=True)
    q1 = fields.Int(required=True)
    q2 = fields.Str(required=True)
    q3 = fields.Str(required=True)
    q4 = fields.Str(required=True)

#regexp for builtIn methods like __magic__
type_regexp = r"^(?:(?!__.*__).)*$"

date_regexp = r"^20\d{2}-[0-1]\d-[0-3]\d$"

class GetSchema(Schema):
    type = fields.Str(required=True, validate=Regexp(type_regexp))
    start = fields.Str(required=True, validate=Regexp(date_regexp))
    end = fields.Str(required=True, validate=Regexp(date_regexp))
    surveyID = fields.Int()
    pathName = fields.Str()
