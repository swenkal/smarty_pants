from marshmallow import Schema, fields

class VisitSchema(Schema):
    uniqueID = fields.Int(required=True)
    visitID = fields.Int(required=True)
    cookieAgree= fields.Boolean(required=True)
    browser = fields.Str(required=True)
    screenWidth = fields.Int(required=True)
    screenHeight = fields.Int(required=True)
    createDate = fields.Int(required=True)
    #createDate = fields.Str(required=True, validate=Regexp(zulu_regexp))
