from marshmallow import Schema, fields

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
