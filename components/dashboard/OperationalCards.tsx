import { ArrowRight, MessageSquare, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function OperationalCards({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Card 1 - Clientes */}
      <Card className="flex flex-col border-border rounded-2xl shadow-sm h-[320px]">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-[15px] font-bold text-foreground">Clientes em destaque</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-0 px-5 pb-5">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-border/50">
                  <TableHead className="text-[12px] font-semibold h-8 text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-[12px] font-semibold h-8 text-muted-foreground">Score</TableHead>
                  <TableHead className="text-[12px] font-semibold h-8 text-right text-muted-foreground">Última compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.clientesDestaque.map((cliente: any) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/50 border-b-border/30">
                    <TableCell className="font-bold text-[13px] text-foreground py-2.5">{cliente.nome}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="bg-green-positive/10 text-green-positive border-green-positive/20 text-[10px] px-2 font-bold rounded-md">
                        {cliente.score}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[12px] font-medium text-muted-foreground py-2.5">
                      {format(new Date(cliente.updatedAt), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="ghost" className="w-full mt-3 text-[13px] text-primary hover:text-primary hover:bg-primary/5 font-semibold gap-1.5 h-9 rounded-xl">
            Ver todos os clientes <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Card 2 - Produtos */}
      <Card className="flex flex-col border-border rounded-2xl shadow-sm h-[320px]">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-[15px] font-bold text-foreground">Produtos com potencial</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-0 px-5 pb-5">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-border/50">
                  <TableHead className="text-[12px] font-semibold h-8 text-muted-foreground">Produto</TableHead>
                  <TableHead className="text-[12px] font-semibold h-8 text-muted-foreground">Potencial</TableHead>
                  <TableHead className="text-[12px] font-semibold h-8 text-right text-muted-foreground">Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.produtosDestaque.map((produto: any) => (
                  <TableRow key={produto.id} className="hover:bg-muted/50 border-b-border/30">
                    <TableCell className="font-bold text-[13px] text-foreground py-2.5">{produto.nome}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 font-bold rounded-md">
                        {produto.scorePotencial}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[12px] font-medium text-muted-foreground py-2.5">{produto.estoqueAtual} un</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button variant="ghost" className="w-full mt-3 text-[13px] text-primary hover:text-primary hover:bg-primary/5 font-semibold gap-1.5 h-9 rounded-xl">
            Ver todos os produtos <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Card 3 - Tarefas */}
      <Card className="flex flex-col border-border rounded-2xl shadow-sm h-[320px]">
        <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-foreground">Tarefas Prioritárias</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted"><Plus className="w-4 h-4 text-muted-foreground" /></Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-0 px-5 pb-5">
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
            {data.tarefasPrioritarias.map((tarefa: any) => (
              <div key={tarefa.id} className="p-3 border border-border rounded-xl bg-muted/30 hover:bg-muted transition-colors group">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="text-[13px] font-bold text-foreground leading-tight">{tarefa.titulo}</h4>
                  <Badge 
                    variant="outline" 
                    className={
                      tarefa.prioridade === "alta" 
                        ? "bg-red-alert/10 text-red-alert border-red-alert/20 text-[10px] px-1.5 py-0 rounded-md font-bold" 
                        : "bg-orange-alert/10 text-orange-alert border-orange-alert/20 text-[10px] px-1.5 py-0 rounded-md font-bold"
                    }
                  >
                    {tarefa.prioridade}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-[11px] font-semibold text-muted-foreground">Prazo: {tarefa.prazo ? format(new Date(tarefa.prazo), "dd/MM/yyyy") : "Sem prazo"}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare className="w-3 h-3 mr-1" /> Resolver
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-3 text-[13px] text-primary hover:text-primary hover:bg-primary/5 font-semibold gap-1.5 h-9 rounded-xl">
            Ver todas as tarefas <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
