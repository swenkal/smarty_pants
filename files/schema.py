from marshmallow.validate import Length
from marshmallow import Schema, fields, validate

class FileSchema(Schema):
    uniqueID = fields.Int(required=True)
    visitID = fields.Int(required=True)
    userGroup = fields.Str(required=True)
    fileID = fields.Str(required=True, validate=Length(equal=16))
    discipline = fields.Str(required=True)
    isArchive = fields.Boolean(required=True)
    referrer = fields.Str(required=True) #url не подходит в связи с тем, что может приходить пустота
    downloadDate = fields.Int(required=True)
    #downloadDate = fields.Str(required=True, validate=Regexp(zulu_regexp))
