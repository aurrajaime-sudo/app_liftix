import { supabase } from '../lib/supabase';

export interface ActivityLog {
  activity_type: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  target_table: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
}

class ActivityLogger {
  async logActivity(log: ActivityLog) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('activity_history')
        .insert({
          user_id: user.id,
          activity_type: log.activity_type,
          description: log.description,
          metadata: log.metadata || {}
        });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async logAudit(log: AuditLog) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: log.action,
          target_table: log.target_table,
          record_id: log.record_id,
          old_data: log.old_data,
          new_data: log.new_data,
          ip_address: await this.getIpAddress(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging audit:', error);
      }
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  async getRecentActivity(limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('activity_history')
        .select(`
          *,
          profiles:user_id (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }

  async getAuditLogs(filters?: {
    action?: string;
    target_table?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.target_table) {
        query = query.eq('target_table', filters.target_table);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  private async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  logLogin() {
    this.logActivity({
      activity_type: 'authentication',
      description: 'Usuario inició sesión',
      metadata: { event: 'login' }
    });
  }

  logLogout() {
    this.logActivity({
      activity_type: 'authentication',
      description: 'Usuario cerró sesión',
      metadata: { event: 'logout' }
    });
  }

  logViewChange(view: string) {
    this.logActivity({
      activity_type: 'navigation',
      description: `Navegó a ${view}`,
      metadata: { view }
    });
  }

  logExport(type: string, recordCount: number) {
    this.logActivity({
      activity_type: 'export',
      description: `Exportó ${recordCount} registros como ${type}`,
      metadata: { type, recordCount }
    });

    this.logAudit({
      action: 'export',
      target_table: 'exports',
      new_data: { type, recordCount }
    });
  }

  logChecklistCompletion(checklistId: string, elevatorId: string) {
    this.logActivity({
      activity_type: 'maintenance',
      description: 'Completó checklist de mantenimiento',
      metadata: { checklistId, elevatorId }
    });

    this.logAudit({
      action: 'create',
      target_table: 'maintenance_checklists',
      record_id: checklistId,
      new_data: { elevatorId, completed: true }
    });
  }

  logClientCreation(clientId: string, clientName: string) {
    this.logActivity({
      activity_type: 'client_management',
      description: `Creó nuevo cliente: ${clientName}`,
      metadata: { clientId, clientName }
    });

    this.logAudit({
      action: 'create',
      target_table: 'clients',
      record_id: clientId,
      new_data: { name: clientName }
    });
  }

  logClientUpdate(clientId: string, oldData: any, newData: any) {
    this.logActivity({
      activity_type: 'client_management',
      description: `Actualizó información de cliente`,
      metadata: { clientId }
    });

    this.logAudit({
      action: 'update',
      target_table: 'clients',
      record_id: clientId,
      old_data: oldData,
      new_data: newData
    });
  }

  logPDFGeneration(checklistId: string, elevatorId: string) {
    this.logActivity({
      activity_type: 'document',
      description: 'Generó PDF de certificación',
      metadata: { checklistId, elevatorId }
    });

    this.logAudit({
      action: 'create',
      target_table: 'documents',
      new_data: { checklistId, elevatorId, type: 'pdf' }
    });
  }
}

export const activityLogger = new ActivityLogger();