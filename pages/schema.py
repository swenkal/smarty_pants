from marshmallow import Schema, fields
from marshmallow.validate import Regexp

class PageSchema(Schema):
    uniqueID = fields.Int(required=True)
    visitID = fields.Int(required=True)
    loadTime = fields.Int(required=True)
    activeTime = fields.Int(required=True)
    pathName = fields.Url(relative=True,required=True)
    referrer = fields.Str(required=True) #url не подходит в связи с тем, что может приходить пустота
    hitDate = fields.Int(required=True)
    #host = fields.Str(required=True)
    #hitDate = fields.Str(required=True, validate=Regexp(zulu_regexp))

#regexp for builtIn methods like __magic__
type_regexp = r"^(?:(?!__.*__).)*$"

date_regexp = r"^20\d{2}-[0-1]\d-[0-3]\d$"

class GetSchema(Schema):
    type = fields.Str(required=True, validate=Regexp(type_regexp))
    start = fields.Str(required=True, validate=Regexp(date_regexp))
    end = fields.Str(required=True, validate=Regexp(date_regexp))
    pathName = fields.Str()
