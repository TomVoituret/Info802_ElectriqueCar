from spyne import Application, rpc, ServiceBase, Integer, Float, Iterable
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication

class TimeTravelService(ServiceBase):
    @rpc(Integer, Float, Float, _returns=Iterable(Float))
    def totalTime(ctx, nbBornes, trajBasic, tempsRecharge):
        res = trajBasic
        for i in range(nbBornes):
            res = res + tempsRecharge
        yield res

application = Application([TimeTravelService], 'spyne.examples.hello.soap',
                           in_protocol=Soap11(validator='lxml'),
                           out_protocol=Soap11())

wsgi_application = WsgiApplication(application)

from wsgiref.simple_server import make_server
import os

port = int(os.environ.get('PORT', 8000))
server = make_server('0.0.0.0', port, wsgi_application)

server.serve_forever()

