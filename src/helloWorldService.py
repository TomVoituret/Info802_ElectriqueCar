from spyne import Application, rpc, ServiceBase, Unicode, Integer, Iterable
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication




class TimeTravelService(ServiceBase):

    @rpc(Integer, float, float, _returns=Iterable(float))
    def totalTime( ctx ,nbBornes, trajBasic, tempsRecharge):
            res = trajBasic
            for i in range(nbBornes):
                res = res + tempsRecharge
            yield res

application = Application([TimeTravelService], 'spyne.examples.hello.soap',
 in_protocol=Soap11(validator='lxml'),
 out_protocol=Soap11())
wsgi_application = WsgiApplication(application)

from wsgiref.simple_server import make_server
server = make_server('127.0.0.1', 8000, wsgi_application)
server.serve_forever()
