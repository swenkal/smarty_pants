from marshmallow.validate import Length, Regexp
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

#regexp for builtIn methods like __magic__
type_regexp = r"^(?:(?!__.*__).)*$"

date_regexp = r"^20\d{2}-[0-1]\d-[0-3]\d$"

class GetSchema(Schema):
    type = fields.Str(required=True, validate=Regexp(type_regexp))
    start = fields.Str(required=True, validate=Regexp(date_regexp))
    end = fields.Str(required=True, validate=Regexp(date_regexp))
    fileID = fields.Str()
    disc = fields.Str()
