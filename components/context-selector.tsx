"use client"

import * as React from "react"
import { Building2, Command, Globe, Check, ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Tipos para refletir a sessão (serão passados via props do servidor)
export type ContextType = 'PLATFORM' | 'MAGISTER' | 'TENANT';

export interface AllowedContext {
  type: ContextType;
  tenantId?: string;
  tenantName?: string;
  role: string;
}

interface ContextSelectorProps {
  activeContext: ContextType;
  activeTenantId?: string | null;
  allowedContexts: AllowedContext[];
  onContextChange?: (type: ContextType, tenantId?: string) => void;
}

export function ContextSelector({ activeContext, activeTenantId, allowedContexts, onContextChange }: ContextSelectorProps) {
  
  const getContextName = (ctx: AllowedContext) => {
    if (ctx.type === 'PLATFORM') return 'Magister Control Center';
    if (ctx.type === 'MAGISTER') return 'ERP Magister Tech';
    return ctx.tenantName || 'Tenant Desconhecido';
  };

  const getContextIcon = (type: ContextType) => {
    if (type === 'PLATFORM') return <Globe className="mr-2 h-4 w-4" />;
    if (type === 'MAGISTER') return <Command className="mr-2 h-4 w-4" />;
    return <Building2 className="mr-2 h-4 w-4" />;
  };

  const activeCtxInfo = allowedContexts.find(c => c.type === activeContext && (c.type !== 'TENANT' || c.tenantId === activeTenantId));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" className="w-[260px] justify-between">
          <div className="flex items-center">
            {activeCtxInfo ? getContextIcon(activeCtxInfo.type) : <Building2 className="mr-2 h-4 w-4" />}
            <span className="truncate max-w-[180px]">
              {activeCtxInfo ? getContextName(activeCtxInfo) : 'Selecione...'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[260px]">
        <DropdownMenuLabel>Ambientes Disponíveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allowedContexts.map((ctx, idx) => {
          const isActive = ctx.type === activeContext && (ctx.type !== 'TENANT' || ctx.tenantId === activeTenantId);
          return (
            <DropdownMenuItem 
              key={idx} 
              onSelect={() => onContextChange && onContextChange(ctx.type, ctx.tenantId)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center">
                {getContextIcon(ctx.type)}
                <span>{getContextName(ctx)}</span>
              </div>
              {isActive && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
