from marshmallow import Schema, fields

class SurveySchema(Schema):
    uniqueID = fields.Int(required=True)
    surveyID = fields.Int(required=True)
    page = fields.Str(required=True)
    q1 = fields.Int(required=True)
    q2 = fields.Str(required=True)
    q3 = fields.Str(required=True)
    q4 = fields.Str(required=True)
    #visitID = fields.Int(required=True)
    #host = fields.Str(required=True)
    #hitDate = fields.Str(required=True, validate=Regexp(zulu_regexp))
