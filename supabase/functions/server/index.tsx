import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-99a65fc7/health", (c) => {
  return c.json({ status: "ok" });
});

// =====================================================
// TENANTS (Clientes) - CRUD
// =====================================================

// Listar todos os tenants
app.get("/make-server-99a65fc7/tenants", async (c) => {
  try {
    const tenants = await kv.getByPrefix("tenant:");
    return c.json(tenants || []);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return c.json({ error: "Failed to fetch tenants", details: String(error) }, 500);
  }
});

// Buscar tenant por ID
app.get("/make-server-99a65fc7/tenants/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tenant = await kv.get(`tenant:${id}`);
    if (!tenant) {
      return c.json({ error: "Tenant not found" }, 404);
    }
    return c.json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return c.json({ error: "Failed to fetch tenant", details: String(error) }, 500);
  }
});

// Criar novo tenant
app.post("/make-server-99a65fc7/tenants", async (c) => {
  try {
    const body = await c.req.json();
    const id = `tenant-${Date.now()}`;
    const tenant = {
      id,
      parentId: body.parentId || null,
      name: body.name,
      document: body.document,
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      autoPhishingConfig: body.autoPhishingConfig || null,
    };
    await kv.set(`tenant:${id}`, tenant);
    return c.json(tenant, 201);
  } catch (error) {
    console.error("Error creating tenant:", error);
    return c.json({ error: "Failed to create tenant", details: String(error) }, 500);
  }
});

// Atualizar tenant
app.put("/make-server-99a65fc7/tenants/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`tenant:${id}`);
    
    if (!existing) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id, // Garantir que o ID não mude
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`tenant:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating tenant:", error);
    return c.json({ error: "Failed to update tenant", details: String(error) }, 500);
  }
});

// Deletar tenant
app.delete("/make-server-99a65fc7/tenants/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`tenant:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return c.json({ error: "Failed to delete tenant", details: String(error) }, 500);
  }
});

// =====================================================
// TEMPLATES - CRUD
// =====================================================

// Listar todos os templates
app.get("/make-server-99a65fc7/templates", async (c) => {
  try {
    const templates = await kv.getByPrefix("template:");
    return c.json(templates || []);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return c.json({ error: "Failed to fetch templates", details: String(error) }, 500);
  }
});

// Buscar template por ID
app.get("/make-server-99a65fc7/templates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const template = await kv.get(`template:${id}`);
    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }
    return c.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return c.json({ error: "Failed to fetch template", details: String(error) }, 500);
  }
});

// Criar novo template
app.post("/make-server-99a65fc7/templates", async (c) => {
  try {
    const body = await c.req.json();
    const id = `template-${Date.now()}`;
    const template = {
      id,
      tenantId: body.tenantId || null,
      name: body.name,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      htmlContent: body.htmlContent,
      hasAttachment: body.hasAttachment || false,
      category: body.category || 'general',
      landingPageHtml: body.landingPageHtml || null,
      captureFields: body.captureFields || [],
      attachmentCount: body.attachmentCount || 0,
      landingAttachmentCount: body.landingAttachmentCount || 0,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`template:${id}`, template);
    return c.json(template, 201);
  } catch (error) {
    console.error("Error creating template:", error);
    return c.json({ error: "Failed to create template", details: String(error) }, 500);
  }
});

// Atualizar template
app.put("/make-server-99a65fc7/templates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`template:${id}`);
    
    if (!existing) {
      return c.json({ error: "Template not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`template:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating template:", error);
    return c.json({ error: "Failed to update template", details: String(error) }, 500);
  }
});

// Deletar template
app.delete("/make-server-99a65fc7/templates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`template:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return c.json({ error: "Failed to delete template", details: String(error) }, 500);
  }
});

// =====================================================
// CAMPAIGNS - CRUD
// =====================================================

// Listar todas as campanhas
app.get("/make-server-99a65fc7/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("campaign:");
    return c.json(campaigns || []);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return c.json({ error: "Failed to fetch campaigns", details: String(error) }, 500);
  }
});

// Buscar campanha por ID
app.get("/make-server-99a65fc7/campaigns/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const campaign = await kv.get(`campaign:${id}`);
    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }
    return c.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return c.json({ error: "Failed to fetch campaign", details: String(error) }, 500);
  }
});

// Criar nova campanha
app.post("/make-server-99a65fc7/campaigns", async (c) => {
  try {
    const body = await c.req.json();
    const id = `campaign-${Date.now()}`;
    const campaign = {
      id,
      tenantId: body.tenantId,
      name: body.name,
      templateId: body.templateId,
      targetGroupIds: body.targetGroupIds || [],
      status: body.status || 'draft',
      type: body.type || 'standard',
      scheduledAt: body.scheduledAt || null,
      createdBy: body.createdBy,
      stats: body.stats || {
        sent: 0,
        opened: 0,
        clicked: 0,
        submitted: 0,
      },
      createdAt: new Date().toISOString(),
    };
    await kv.set(`campaign:${id}`, campaign);
    return c.json(campaign, 201);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return c.json({ error: "Failed to create campaign", details: String(error) }, 500);
  }
});

// Atualizar campanha
app.put("/make-server-99a65fc7/campaigns/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`campaign:${id}`);
    
    if (!existing) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`campaign:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return c.json({ error: "Failed to update campaign", details: String(error) }, 500);
  }
});

// Deletar campanha
app.delete("/make-server-99a65fc7/campaigns/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`campaign:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return c.json({ error: "Failed to delete campaign", details: String(error) }, 500);
  }
});

// =====================================================
// TARGETS (Alvos/Colaboradores) - CRUD
// =====================================================

// Listar todos os targets
app.get("/make-server-99a65fc7/targets", async (c) => {
  try {
    const targets = await kv.getByPrefix("target:");
    // Filtrar para não pegar target-groups
    const filteredTargets = targets.filter((t: any) => !t.id?.startsWith('target-group'));
    return c.json(filteredTargets || []);
  } catch (error) {
    console.error("Error fetching targets:", error);
    return c.json({ error: "Failed to fetch targets", details: String(error) }, 500);
  }
});

// Buscar target por ID
app.get("/make-server-99a65fc7/targets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const target = await kv.get(`target:${id}`);
    if (!target) {
      return c.json({ error: "Target not found" }, 404);
    }
    return c.json(target);
  } catch (error) {
    console.error("Error fetching target:", error);
    return c.json({ error: "Failed to fetch target", details: String(error) }, 500);
  }
});

// Criar novo target
app.post("/make-server-99a65fc7/targets", async (c) => {
  try {
    const body = await c.req.json();
    const id = `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const target = {
      id,
      tenantId: body.tenantId,
      email: body.email,
      name: body.name,
      department: body.department || null,
      position: body.position || null,
      group: body.group || null,
      status: body.status || 'active',
      source: body.source || 'manual',
      createdAt: new Date().toISOString(),
    };
    await kv.set(`target:${id}`, target);
    return c.json(target, 201);
  } catch (error) {
    console.error("Error creating target:", error);
    return c.json({ error: "Failed to create target", details: String(error) }, 500);
  }
});

// Atualizar target
app.put("/make-server-99a65fc7/targets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`target:${id}`);
    
    if (!existing) {
      return c.json({ error: "Target not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`target:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating target:", error);
    return c.json({ error: "Failed to update target", details: String(error) }, 500);
  }
});

// Deletar target
app.delete("/make-server-99a65fc7/targets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`target:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting target:", error);
    return c.json({ error: "Failed to delete target", details: String(error) }, 500);
  }
});

// Deletar TODOS os targets de um tenant específico
app.delete("/make-server-99a65fc7/targets/tenant/:tenantId", async (c) => {
  try {
    const tenantId = c.req.param("tenantId");
    
    console.log(`🔍 Buscando targets do tenant ${tenantId} para deletar...`);
    
    if (!tenantId) {
      console.error('❌ Tenant ID não fornecido');
      return c.json({ error: "Tenant ID é obrigatório" }, 400);
    }
    
    // Buscar todos os targets
    const allTargets = await kv.getByPrefix("target:");
    
    console.log(`📊 Total de registros encontrados com prefixo "target:": ${allTargets.length}`);
    
    // Filtrar apenas os targets (não target-groups) do tenant especificado
    const targetsToDelete = allTargets.filter((t: any) => {
      const isNotTargetGroup = !t.id?.startsWith('target-group');
      const matchesTenant = t.tenantId === tenantId;
      return isNotTargetGroup && matchesTenant;
    });
    
    console.log(`🎯 Targets filtrados para deletar: ${targetsToDelete.length}`);
    
    // Verificar se há targets para deletar
    if (targetsToDelete.length === 0) {
      console.log(`ℹ️ Nenhum target encontrado para o tenant ${tenantId}`);
      return c.json({ 
        success: true, 
        deletedCount: 0,
        tenantId,
        message: 'Nenhum target encontrado para deletar'
      });
    }
    
    // Preparar keys para deletar
    const deleteKeys = targetsToDelete.map((t: any) => `target:${t.id}`);
    
    console.log(`🗑️ Deletando ${deleteKeys.length} targets em batches...`);
    
    // Deletar em batches de 50 para evitar timeout
    const BATCH_SIZE = 50;
    let deletedCount = 0;
    
    for (let i = 0; i < deleteKeys.length; i += BATCH_SIZE) {
      const batch = deleteKeys.slice(i, i + BATCH_SIZE);
      console.log(`  🔄 Deletando batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} targets`);
      
      try {
        await kv.mdel(batch);
        deletedCount += batch.length;
        console.log(`  ✅ Batch deletado com sucesso`);
      } catch (batchError) {
        console.error(`  ❌ Erro ao deletar batch:`, batchError);
        // Continue tentando outros batches mesmo se um falhar
      }
    }
    
    console.log(`✅ ${deletedCount} targets deletados com sucesso do tenant ${tenantId}`);
    
    return c.json({ 
      success: true, 
      deletedCount: deletedCount,
      tenantId 
    });
  } catch (error) {
    console.error("❌ Error deleting targets by tenant:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A');
    return c.json({ 
      error: "Failed to delete targets", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// =====================================================
// TARGET GROUPS - CRUD
// =====================================================

// Listar todos os target groups
app.get("/make-server-99a65fc7/target-groups", async (c) => {
  try {
    const groups = await kv.getByPrefix("target-group:");
    return c.json(groups || []);
  } catch (error) {
    console.error("Error fetching target groups:", error);
    return c.json({ error: "Failed to fetch target groups", details: String(error) }, 500);
  }
});

// Buscar target group por ID
app.get("/make-server-99a65fc7/target-groups/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const group = await kv.get(`target-group:${id}`);
    if (!group) {
      return c.json({ error: "Target group not found" }, 404);
    }
    return c.json(group);
  } catch (error) {
    console.error("Error fetching target group:", error);
    return c.json({ error: "Failed to fetch target group", details: String(error) }, 500);
  }
});

// Criar novo target group
app.post("/make-server-99a65fc7/target-groups", async (c) => {
  try {
    const body = await c.req.json();
    const id = `target-group-${Date.now()}`;
    const group = {
      id,
      tenantId: body.tenantId,
      name: body.name,
      description: body.description || '',
      type: body.type || 'local',
      source: body.source || 'manual',
      integrationProvider: body.integrationProvider || null,
      memberCount: body.memberCount || 0,
      targetIds: body.targetIds || [],
      nestedGroupIds: body.nestedGroupIds || [],
      parentGroupId: body.parentGroupId || null,
      syncEnabled: body.syncEnabled || false,
      lastSyncAt: body.lastSyncAt || null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`target-group:${id}`, group);
    return c.json(group, 201);
  } catch (error) {
    console.error("Error creating target group:", error);
    return c.json({ error: "Failed to create target group", details: String(error) }, 500);
  }
});

// Atualizar target group
app.put("/make-server-99a65fc7/target-groups/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`target-group:${id}`);
    
    if (!existing) {
      return c.json({ error: "Target group not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`target-group:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating target group:", error);
    return c.json({ error: "Failed to update target group", details: String(error) }, 500);
  }
});

// Deletar target group
app.delete("/make-server-99a65fc7/target-groups/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`target-group:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting target group:", error);
    return c.json({ error: "Failed to delete target group", details: String(error) }, 500);
  }
});

// =====================================================
// TRAININGS - CRUD
// =====================================================

// Listar todos os trainings
app.get("/make-server-99a65fc7/trainings", async (c) => {
  try {
    const trainings = await kv.getByPrefix("training:");
    return c.json(trainings || []);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return c.json({ error: "Failed to fetch trainings", details: String(error) }, 500);
  }
});

// Buscar training por ID
app.get("/make-server-99a65fc7/trainings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const training = await kv.get(`training:${id}`);
    if (!training) {
      return c.json({ error: "Training not found" }, 404);
    }
    return c.json(training);
  } catch (error) {
    console.error("Error fetching training:", error);
    return c.json({ error: "Failed to fetch training", details: String(error) }, 500);
  }
});

// Criar novo training
app.post("/make-server-99a65fc7/trainings", async (c) => {
  try {
    const body = await c.req.json();
    const id = `training-${Date.now()}`;
    const training = {
      id,
      tenantId: body.tenantId || null,
      title: body.title,
      type: body.type || 'video',
      mediaUrl: body.mediaUrl,
      duration: body.duration || 0,
      description: body.description || '',
      createdAt: new Date().toISOString(),
    };
    await kv.set(`training:${id}`, training);
    return c.json(training, 201);
  } catch (error) {
    console.error("Error creating training:", error);
    return c.json({ error: "Failed to create training", details: String(error) }, 500);
  }
});

// Atualizar training
app.put("/make-server-99a65fc7/trainings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`training:${id}`);
    
    if (!existing) {
      return c.json({ error: "Training not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`training:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating training:", error);
    return c.json({ error: "Failed to update training", details: String(error) }, 500);
  }
});

// Deletar training
app.delete("/make-server-99a65fc7/trainings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`training:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting training:", error);
    return c.json({ error: "Failed to delete training", details: String(error) }, 500);
  }
});

// =====================================================
// AUTOMATIONS - CRUD
// =====================================================

// Listar todas as automações
app.get("/make-server-99a65fc7/automations", async (c) => {
  try {
    const automations = await kv.getByPrefix("automation:");
    return c.json(automations || []);
  } catch (error) {
    console.error("Error fetching automations:", error);
    return c.json({ error: "Failed to fetch automations", details: String(error) }, 500);
  }
});

// Buscar automation por ID
app.get("/make-server-99a65fc7/automations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const automation = await kv.get(`automation:${id}`);
    if (!automation) {
      return c.json({ error: "Automation not found" }, 404);
    }
    return c.json(automation);
  } catch (error) {
    console.error("Error fetching automation:", error);
    return c.json({ error: "Failed to fetch automation", details: String(error) }, 500);
  }
});

// Criar nova automation
app.post("/make-server-99a65fc7/automations", async (c) => {
  try {
    const body = await c.req.json();
    const id = `automation-${Date.now()}`;
    const automation = {
      id,
      tenantId: body.tenantId,
      name: body.name,
      description: body.description || '',
      trigger: body.trigger,
      triggerDelay: body.triggerDelay || 0,
      condition: body.condition || { type: 'always' },
      campaignTemplateId: body.campaignTemplateId,
      status: body.status || 'paused',
      executionCount: body.executionCount || 0,
      lastExecutedAt: body.lastExecutedAt || null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`automation:${id}`, automation);
    return c.json(automation, 201);
  } catch (error) {
    console.error("Error creating automation:", error);
    return c.json({ error: "Failed to create automation", details: String(error) }, 500);
  }
});

// Atualizar automation
app.put("/make-server-99a65fc7/automations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`automation:${id}`);
    
    if (!existing) {
      return c.json({ error: "Automation not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`automation:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating automation:", error);
    return c.json({ error: "Failed to update automation", details: String(error) }, 500);
  }
});

// Deletar automation
app.delete("/make-server-99a65fc7/automations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`automation:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting automation:", error);
    return c.json({ error: "Failed to delete automation", details: String(error) }, 500);
  }
});

// =====================================================
// SETTINGS - Configurações do Sistema
// =====================================================

// Buscar configurações
app.get("/make-server-99a65fc7/settings", async (c) => {
  try {
    const settings = await kv.get("settings:global");
    
    // Se não existir, retornar configurações padrão
    if (!settings) {
      const defaultSettings = {
        general: {
          organizationName: 'Under Protection',
          domain: 'underprotection.com.br',
          description: 'Plataforma de Simulação de Phishing e Conscientização',
          timezone: 'america-sao-paulo',
          language: 'pt-br',
          maintenanceMode: false,
          autoArchiveCampaigns: true,
        },
        smtp: {
          host: '',
          port: 587,
          user: '',
          password: '',
          from: '',
          encryption: 'tls',
        },
        syslog: {
          host: '',
          port: 514,
          protocol: 'udp',
          facility: 'local0',
          auditLogsEnabled: false,
          phishingEventsEnabled: false,
        },
        integrations: {
          microsoft365: {
            enabled: false,
            tenantId: '',
            clientId: '',
            clientSecret: '',
            autoSync: false,
          },
          googleWorkspace: {
            enabled: false,
            serviceAccountJson: '',
            domain: '',
          },
          azure: {
            enabled: false,
            tenantId: '',
            clientId: '',
            clientSecret: '',
            autoSync: false,
          },
        },
      };
      
      await kv.set("settings:global", defaultSettings);
      return c.json({ settings: defaultSettings });
    }
    
    return c.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return c.json({ error: "Failed to fetch settings", details: String(error) }, 500);
  }
});

// Atualizar configurações
app.put("/make-server-99a65fc7/settings", async (c) => {
  try {
    const body = await c.req.json();
    
    const updatedSettings = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("settings:global", updatedSettings);
    console.log("✅ Settings updated successfully");
    
    return c.json({ settings: updatedSettings, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return c.json({ error: "Failed to update settings", details: String(error) }, 500);
  }
});

// =====================================================
// LANDING PAGES - CRUD
// =====================================================

// Listar todas as landing pages
app.get("/make-server-99a65fc7/landing-pages", async (c) => {
  try {
    const landingPages = await kv.getByPrefix("landing-page:");
    return c.json(landingPages || []);
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return c.json({ error: "Failed to fetch landing pages", details: String(error) }, 500);
  }
});

// Buscar landing page por ID
app.get("/make-server-99a65fc7/landing-pages/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const landingPage = await kv.get(`landing-page:${id}`);
    if (!landingPage) {
      return c.json({ error: "Landing page not found" }, 404);
    }
    return c.json(landingPage);
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return c.json({ error: "Failed to fetch landing page", details: String(error) }, 500);
  }
});

// Criar nova landing page
app.post("/make-server-99a65fc7/landing-pages", async (c) => {
  try {
    const body = await c.req.json();
    const id = `landing-page-${Date.now()}`;
    const landingPage = {
      id,
      tenantId: body.tenantId || null,
      name: body.name,
      description: body.description || '',
      url: body.url || `https://lp-${Date.now()}.example.com`,
      type: body.type || 'custom',
      template: body.template || 'blank',
      htmlContent: body.htmlContent || '',
      cssContent: body.cssContent || '',
      jsContent: body.jsContent || '',
      captureFields: body.captureFields || [],
      capturesCount: body.capturesCount || 0,
      clicksCount: body.clicksCount || 0,
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
    };
    await kv.set(`landing-page:${id}`, landingPage);
    return c.json(landingPage, 201);
  } catch (error) {
    console.error("Error creating landing page:", error);
    return c.json({ error: "Failed to create landing page", details: String(error) }, 500);
  }
});

// Atualizar landing page
app.put("/make-server-99a65fc7/landing-pages/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`landing-page:${id}`);
    
    if (!existing) {
      return c.json({ error: "Landing page not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`landing-page:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating landing page:", error);
    return c.json({ error: "Failed to update landing page", details: String(error) }, 500);
  }
});

// Deletar landing page
app.delete("/make-server-99a65fc7/landing-pages/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`landing-page:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return c.json({ error: "Failed to delete landing page", details: String(error) }, 500);
  }
});

// =====================================================
// CERTIFICATES - CRUD
// =====================================================

// Listar todos os certificados
app.get("/make-server-99a65fc7/certificates", async (c) => {
  try {
    const certificates = await kv.getByPrefix("certificate:");
    return c.json(certificates || []);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return c.json({ error: "Failed to fetch certificates", details: String(error) }, 500);
  }
});

// Buscar certificado por ID
app.get("/make-server-99a65fc7/certificates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const certificate = await kv.get(`certificate:${id}`);
    if (!certificate) {
      return c.json({ error: "Certificate not found" }, 404);
    }
    return c.json(certificate);
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return c.json({ error: "Failed to fetch certificate", details: String(error) }, 500);
  }
});

// Criar novo certificado
app.post("/make-server-99a65fc7/certificates", async (c) => {
  try {
    const body = await c.req.json();
    const id = `certificate-${Date.now()}`;
    const certificate = {
      id,
      tenantId: body.tenantId || null,
      userId: body.userId,
      userName: body.userName,
      userEmail: body.userEmail,
      trainingId: body.trainingId,
      trainingTitle: body.trainingTitle,
      completedAt: body.completedAt || new Date().toISOString(),
      issuedAt: new Date().toISOString(),
      certificateCode: body.certificateCode || `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      score: body.score || 0,
      templateId: body.templateId || 'default',
      status: body.status || 'issued',
      createdAt: new Date().toISOString(),
    };
    await kv.set(`certificate:${id}`, certificate);
    return c.json(certificate, 201);
  } catch (error) {
    console.error("Error creating certificate:", error);
    return c.json({ error: "Failed to create certificate", details: String(error) }, 500);
  }
});

// Atualizar certificado
app.put("/make-server-99a65fc7/certificates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`certificate:${id}`);
    
    if (!existing) {
      return c.json({ error: "Certificate not found" }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`certificate:${id}`, updated);
    return c.json(updated);
  } catch (error) {
    console.error("Error updating certificate:", error);
    return c.json({ error: "Failed to update certificate", details: String(error) }, 500);
  }
});

// Deletar certificado
app.delete("/make-server-99a65fc7/certificates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`certificate:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return c.json({ error: "Failed to delete certificate", details: String(error) }, 500);
  }
});

// =====================================================
// MICROSOFT AZURE / GRAPH API - Integração
// =====================================================

// Helper para obter token do Azure AD
async function getAzureAccessToken(tenantId: string, clientId: string, clientSecret: string) {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    console.log('🔑 Requesting Azure access token...', {
      endpoint: tokenEndpoint,
      clientId: clientId.substring(0, 8) + '...',
      tenantId: tenantId.substring(0, 8) + '...',
    });
    
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Azure token request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      
      // Parse error details if available
      let errorMessage = `Azure AD authentication failed: ${response.statusText} (${response.status})`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error_description) {
          // Extract readable error from Azure AD error description
          const description = errorJson.error_description;
          
          // Common Azure AD errors with friendly messages
          if (description.includes('AADSTS900023') || description.includes('neither a valid DNS name')) {
            errorMessage = 'Tenant ID inválido. Verifique se o Directory (tenant) ID está correto no Portal Azure.';
          } else if (description.includes('AADSTS700016') || description.includes('Application with identifier')) {
            errorMessage = 'Application (Client) ID inválido. Verifique se o Client ID está correto.';
          } else if (description.includes('AADSTS7000215') || description.includes('Invalid client secret')) {
            errorMessage = 'Client Secret inválido. Verifique se você copiou o Value (não o Secret ID).';
          } else if (description.includes('AADSTS50034') || description.includes('user account') || description.includes('does not exist')) {
            errorMessage = 'Conta de usuário não encontrada no diretório.';
          } else if (description.includes('AADSTS65001') || description.includes('consent')) {
            errorMessage = 'Permissões não concedidas. Clique em "Grant admin consent" no Portal Azure.';
          } else {
            // Use the full error description for other errors
            errorMessage = description.split('Trace ID:')[0].trim();
          }
        } else if (errorJson.error) {
          errorMessage = `Azure AD error: ${errorJson.error}`;
        }
      } catch (parseError) {
        // If parsing fails, use the raw error text if it's short enough
        if (errorData.length < 200) {
          errorMessage = `Azure AD authentication failed: ${errorData}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Azure access token obtained successfully');
    return data.access_token;
  } catch (error: any) {
    console.error('❌ Error getting Azure access token:', error.message);
    throw error;
  }
}

// Testar conexão com Azure AD
app.post("/make-server-99a65fc7/azure/test-connection", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, clientId, clientSecret } = body;

    if (!tenantId || !clientId || !clientSecret) {
      console.error("❌ Missing Azure credentials");
      return c.json({ 
        success: false,
        error: "Missing required credentials",
        details: "Por favor, preencha todos os campos obrigatórios: Tenant ID, Client ID e Client Secret"
      }, 400);
    }

    console.log("🔵 Testing Azure AD connection...");
    
    // Tentar obter token
    const accessToken = await getAzureAccessToken(tenantId, clientId, clientSecret);
    
    console.log("🔍 Fetching organization info from Microsoft Graph...");
    
    // Tentar buscar info do tenant
    const response = await fetch('https://graph.microsoft.com/v1.0/organization', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to fetch organization info:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to fetch organization info: ${response.statusText}`);
    }

    const orgData = await response.json();
    
    console.log("✅ Azure AD connection successful!");
    
    return c.json({
      success: true,
      message: "Conexão com Azure AD estabelecida com sucesso!",
      organization: {
        name: orgData.value[0]?.displayName || "N/A",
        domain: orgData.value[0]?.verifiedDomains?.[0]?.name || "N/A",
        tenantId: orgData.value[0]?.id || tenantId,
      }
    });
  } catch (error: any) {
    console.error("❌ Error testing Azure connection:", error);
    
    // The error message from getAzureAccessToken already contains user-friendly messages
    // Just pass it through with appropriate categorization
    let errorMessage = "Falha ao conectar com Azure AD";
    let errorDetails = error.message;
    
    // Check if we already have a friendly error message from getAzureAccessToken
    if (error.message.includes("Tenant ID inválido")) {
      errorMessage = "Tenant ID Inválido";
    } else if (error.message.includes("Client ID inválido")) {
      errorMessage = "Client ID Inválido";
    } else if (error.message.includes("Client Secret inválido")) {
      errorMessage = "Client Secret Inválido";
    } else if (error.message.includes("Permissões não concedidas")) {
      errorMessage = "Permissões Necessárias";
    } else if (error.message.includes("network") || error.message.includes("fetch failed")) {
      errorMessage = "Erro de Conexão";
      errorDetails = "Não foi possível conectar aos serviços do Azure. Verifique sua conexão de internet.";
    }
    
    return c.json({ 
      success: false,
      error: errorMessage, 
      details: errorDetails
    }, 500);
  }
});

// Buscar usuários do Azure AD
app.post("/make-server-99a65fc7/azure/users", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, clientId, clientSecret, maxResults = 100 } = body;

    if (!tenantId || !clientId || !clientSecret) {
      return c.json({ error: "Missing required credentials" }, 400);
    }

    console.log("🔵 Fetching users from Azure AD...");
    
    const accessToken = await getAzureAccessToken(tenantId, clientId, clientSecret);
    
    // Buscar usuários via Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users?$top=${maxResults}&$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,accountEnabled`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    
    const users = data.value.map((user: any) => ({
      id: user.id,
      displayName: user.displayName,
      email: user.mail || user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
      officeLocation: user.officeLocation,
      accountEnabled: user.accountEnabled,
    }));

    return c.json({
      success: true,
      users,
      count: users.length,
      hasMore: !!data['@odata.nextLink'],
    });
  } catch (error: any) {
    console.error("❌ Error fetching Azure users:", error);
    return c.json({ 
      error: "Failed to fetch users from Azure AD", 
      details: error.message 
    }, 500);
  }
});

// Buscar grupos do Azure AD
app.post("/make-server-99a65fc7/azure/groups", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, clientId, clientSecret, maxResults = 100 } = body;

    if (!tenantId || !clientId || !clientSecret) {
      return c.json({ error: "Missing required credentials" }, 400);
    }

    console.log("🔵 Fetching groups from Azure AD...");
    
    const accessToken = await getAzureAccessToken(tenantId, clientId, clientSecret);
    
    // Buscar grupos via Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/groups?$top=${maxResults}&$select=id,displayName,description,mail,mailEnabled,securityEnabled`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }

    const data = await response.json();
    
    const groups = data.value.map((group: any) => ({
      id: group.id,
      displayName: group.displayName,
      description: group.description,
      email: group.mail,
      mailEnabled: group.mailEnabled,
      securityEnabled: group.securityEnabled,
    }));

    return c.json({
      success: true,
      groups,
      count: groups.length,
      hasMore: !!data['@odata.nextLink'],
    });
  } catch (error: any) {
    console.error("❌ Error fetching Azure groups:", error);
    return c.json({ 
      error: "Failed to fetch groups from Azure AD", 
      details: error.message 
    }, 500);
  }
});

// Buscar membros de um grupo específico
app.post("/make-server-99a65fc7/azure/group-members", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, clientId, clientSecret, groupId } = body;

    if (!tenantId || !clientId || !clientSecret || !groupId) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    console.log(`🔵 Fetching members of group ${groupId} from Azure AD...`);
    
    const accessToken = await getAzureAccessToken(tenantId, clientId, clientSecret);
    
    // Buscar membros do grupo via Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/groups/${groupId}/members?$select=id,displayName,mail,userPrincipalName,jobTitle,department`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch group members: ${response.statusText}`);
    }

    const data = await response.json();
    
    const members = data.value.map((member: any) => ({
      id: member.id,
      displayName: member.displayName,
      email: member.mail || member.userPrincipalName,
      jobTitle: member.jobTitle,
      department: member.department,
    }));

    return c.json({
      success: true,
      members,
      count: members.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching Azure group members:", error);
    return c.json({ 
      error: "Failed to fetch group members from Azure AD", 
      details: error.message 
    }, 500);
  }
});

// Sincronizar usuários do Azure AD para o banco
app.post("/make-server-99a65fc7/azure/sync-users", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, clientId, clientSecret, targetTenantId, allowedDomains } = body;

    if (!tenantId || !clientId || !clientSecret || !targetTenantId) {
      console.error("❌ Missing required parameters for Azure sync");
      return c.json({ 
        success: false,
        error: "Parâmetros obrigatórios ausentes",
        details: "Tenant ID, Client ID, Client Secret e Target Tenant ID são obrigatórios"
      }, 400);
    }

    console.log("🔵 Syncing users from Azure AD to database...");
    console.log(`   Target Tenant ID: ${targetTenantId}`);
    console.log(`   Allowed Domains: ${allowedDomains?.join(', ') || 'ALL (no filter)'}`);
    
    // Get Azure access token
    let accessToken;
    try {
      accessToken = await getAzureAccessToken(tenantId, clientId, clientSecret);
    } catch (authError: any) {
      console.error("❌ Azure authentication failed during sync:", authError.message);
      return c.json({ 
        success: false,
        error: "Falha na autenticação Azure AD",
        details: authError.message
      }, 401);
    }
    
    // Buscar usuários via Graph API
    console.log("📡 Fetching users from Microsoft Graph API...");
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/users?$top=999&$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,accountEnabled',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Microsoft Graph API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return c.json({ 
        success: false,
        error: `Falha ao buscar usuários do Azure AD: ${response.statusText}`,
        details: errorText
      }, 500);
    }

    const data = await response.json();
    
    if (!data.value || !Array.isArray(data.value)) {
      console.error("❌ Invalid response from Microsoft Graph API:", data);
      return c.json({ 
        success: false,
        error: "Resposta inválida da API do Azure",
        details: "Formato de resposta inesperado"
      }, 500);
    }
    
    console.log(`📊 Found ${data.value.length} users in Azure AD`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    let filteredByDomain = 0;
    const errors: string[] = [];
    
    // Função auxiliar para verificar se o email pertence aos domínios permitidos
    const isAllowedDomain = (email: string): boolean => {
      if (!allowedDomains || allowedDomains.length === 0) {
        return true; // Se não há filtro de domínio, permite todos
      }
      
      const emailDomain = email.split('@')[1]?.toLowerCase();
      return allowedDomains.some((domain: string) => 
        emailDomain === domain.toLowerCase().trim()
      );
    };
    
    // Process users in batches to avoid timeout
    console.log(`⚙️ Processing users in batches...`);
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < data.value.length; i += batchSize) {
      batches.push(data.value.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of up to ${batchSize} users each`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`   Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} users)...`);
      
      const batchPromises = batch.map(async (user: any) => {
        try {
          // Só sincronizar usuários ativos com email
          const email = user.mail || user.userPrincipalName;
          if (!user.accountEnabled || !email) {
            return { skipped: true };
          }
          
          // Filtrar por domínio permitido
          if (!isAllowedDomain(email)) {
            return { filteredByDomain: true };
          }
          
          const targetId = `target-azure-${user.id}`;
          
          // Verificar se já existe
          const existing = await kv.get(`target:${targetId}`);
          
          const targetData = {
            id: targetId,
            tenantId: targetTenantId,
            email: email,
            name: user.displayName,
            department: user.department || null,
            position: user.jobTitle || null,
            group: null,
            status: 'active',
            source: 'azure-ad',
            azureId: user.id,
            officeLocation: user.officeLocation || null,
            lastSyncAt: new Date().toISOString(),
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await kv.set(`target:${targetId}`, targetData);
          return { synced: true };
        } catch (userError: any) {
          console.error(`❌ Error syncing user ${user.displayName}:`, userError);
          return { error: `${user.displayName}: ${userError.message}` };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Count results
      for (const result of batchResults) {
        if (result.synced) syncedCount++;
        else if (result.skipped) skippedCount++;
        else if (result.filteredByDomain) filteredByDomain++;
        else if (result.error) errors.push(result.error);
      }
      
      console.log(`   ✅ Batch ${batchIndex + 1} complete: ${syncedCount} synced so far`);
    }

    console.log(`✅ Synced ${syncedCount} users from Azure AD (skipped ${skippedCount}, filtered ${filteredByDomain} by domain)`);
    
    return c.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      filteredByDomain: filteredByDomain,
      total: data.value.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${syncedCount} usuários sincronizados com sucesso!`,
    });
  } catch (error: any) {
    console.error("❌ Error syncing Azure users:", error);
    console.error("❌ Error stack:", error.stack);
    return c.json({ 
      success: false,
      error: "Falha ao sincronizar usuários do Azure AD",
      details: error.message || "Erro desconhecido"
    }, 500);
  }
});

// Sincronizar grupos do Azure AD para o banco
app.post("/make-server-99a65fc7/azure/sync-groups", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, clientId, clientSecret, targetTenantId, allowedDomains } = body;

    if (!tenantId || !clientId || !clientSecret || !targetTenantId) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    console.log("🔵 Syncing groups from Azure AD to database...");
    console.log(`   Target Tenant ID: ${targetTenantId}`);
    console.log(`   Allowed Domains: ${allowedDomains?.join(', ') || 'ALL (no filter)'}`);
    
    const accessToken = await getAzureAccessToken(tenantId, clientId, clientSecret);
    
    // Buscar grupos via Graph API
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/groups?$top=999&$select=id,displayName,description,mail,mailEnabled,securityEnabled',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`📊 Found ${data.value.length} groups in Azure AD`);
    console.log(`⚙️ Processing groups in parallel batches...`);
    
    let syncedCount = 0;
    const batchSize = 10; // Smaller batch for groups since each requires additional API call
    const batches = [];
    
    for (let i = 0; i < data.value.length; i += batchSize) {
      batches.push(data.value.slice(i, i + batchSize));
    }
    
    console.log(`📦 Processing ${batches.length} batches of up to ${batchSize} groups each`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`   Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} groups)...`);
      
      const batchPromises = batch.map(async (group: any) => {
        try {
          const groupId = `target-group-azure-${group.id}`;
          
          // Buscar membros do grupo
          const membersResponse = await fetch(
            `https://graph.microsoft.com/v1.0/groups/${group.id}/members?$select=id`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          
          let memberCount = 0;
          const targetIds: string[] = [];
          
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            memberCount = membersData.value.length;
            
            // Mapear IDs dos membros para IDs de targets
            targetIds = membersData.value.map((member: any) => `target-azure-${member.id}`);
          }
          
          const existing = await kv.get(`target-group:${groupId}`);
          
          const groupData = {
            id: groupId,
            tenantId: targetTenantId,
            name: group.displayName,
            description: group.description || '',
            type: 'azure-ad',
            source: 'azure-ad',
            integrationProvider: 'microsoft365',
            memberCount: memberCount,
            targetIds: targetIds,
            nestedGroupIds: [],
            parentGroupId: null,
            syncEnabled: true,
            lastSyncAt: new Date().toISOString(),
            azureId: group.id,
            email: group.mail || null,
            mailEnabled: group.mailEnabled,
            securityEnabled: group.securityEnabled,
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await kv.set(`target-group:${groupId}`, groupData);
          return { synced: true };
        } catch (groupError: any) {
          console.error(`❌ Error syncing group ${group.displayName}:`, groupError);
          return { error: groupError.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Count successful syncs
      for (const result of batchResults) {
        if (result.synced) syncedCount++;
      }
      
      console.log(`   ✅ Batch ${batchIndex + 1} complete: ${syncedCount} synced so far`);
    }

    console.log(`✅ Synced ${syncedCount} groups from Azure AD`);
    
    return c.json({
      success: true,
      synced: syncedCount,
      total: data.value.length,
      message: `${syncedCount} grupos sincronizados com sucesso!`,
    });
  } catch (error: any) {
    console.error("❌ Error syncing Azure groups:", error);
    return c.json({ 
      error: "Failed to sync groups from Azure AD", 
      details: error.message 
    }, 500);
  }
});

// =====================================================
// SEED - Popular banco com dados de exemplo
// =====================================================

app.post("/make-server-99a65fc7/seed", async (c) => {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");
    
    // Verificar se já tem dados
    const existingTenants = await kv.getByPrefix("tenant:");
    if (existingTenants && existingTenants.length > 0) {
      console.log("⚠️ Banco já possui dados, pulando seed");
      return c.json({ 
        message: "Database already seeded",
        existing: {
          tenants: existingTenants.length
        }
      });
    }

    const created = {
      tenants: 0,
      templates: 0,
      targets: 0,
      targetGroups: 0,
      campaigns: 0,
      trainings: 0,
      certificates: 0,
      landingPages: 0,
      automations: 0,
    };

    // 1. TENANTS
    const tenants = [
      {
        id: 'tenant-acme-corp',
        name: 'Acme Corporation',
        domain: 'acme.com',
        industry: 'Tecnologia',
        employeeCount: 500,
        status: 'active',
        adminName: 'João Silva',
        adminEmail: 'joao.silva@acme.com',
        plan: 'enterprise',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tenant-global-bank',
        name: 'Global Bank',
        domain: 'globalbank.com.br',
        industry: 'Financeiro',
        employeeCount: 1200,
        status: 'active',
        adminName: 'Maria Santos',
        adminEmail: 'maria.santos@globalbank.com.br',
        plan: 'enterprise',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'tenant-health-plus',
        name: 'Health Plus',
        domain: 'healthplus.com.br',
        industry: 'Saúde',
        employeeCount: 300,
        status: 'active',
        adminName: 'Pedro Oliveira',
        adminEmail: 'pedro@healthplus.com.br',
        plan: 'professional',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const tenant of tenants) {
      await kv.set(`tenant:${tenant.id}`, tenant);
      created.tenants++;
    }

    // 2. TEMPLATES
    const templates = [
      {
        id: 'template-office365',
        tenantId: null,
        name: 'Login Office 365',
        subject: 'Atualize sua senha do Office 365',
        content: '<html><body><h1>Office 365</h1><p>Sua senha expirará em breve. Clique aqui para atualizar.</p></body></html>',
        type: 'email',
        category: 'Credential Harvesting',
        difficulty: 'medium',
        language: 'pt-BR',
        sender: 'noreply@microsoft.com',
        isPublic: true,
        clicksCount: 0,
        submitsCount: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'template-payroll',
        tenantId: null,
        name: 'RH - Contracheque',
        subject: 'Seu contracheque está disponível',
        content: '<html><body><h1>Departamento de RH</h1><p>Seu contracheque do mês está disponível para download.</p></body></html>',
        type: 'email',
        category: 'Pretexting',
        difficulty: 'easy',
        language: 'pt-BR',
        sender: 'rh@empresa.com',
        isPublic: true,
        clicksCount: 0,
        submitsCount: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'template-urgent-ceo',
        tenantId: null,
        name: 'CEO - Transferência Urgente',
        subject: 'URGENTE: Transferência necessária',
        content: '<html><body><h1>Assunto Urgente</h1><p>Preciso que você faça uma transferência imediatamente. Não comente com ninguém.</p></body></html>',
        type: 'email',
        category: 'Business Email Compromise',
        difficulty: 'hard',
        language: 'pt-BR',
        sender: 'ceo@empresa.com',
        isPublic: true,
        clicksCount: 0,
        submitsCount: 0,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const template of templates) {
      await kv.set(`template:${template.id}`, template);
      created.templates++;
    }

    // 3. TARGETS (Alvos) - Apenas exemplos de clientes, sem emails da Under Protection
    const targets = [
      { id: 'target-1', tenantId: 'tenant-acme-corp', name: 'Ana Costa', email: 'ana.costa@acme.com', department: 'TI', position: 'Analista', status: 'active', source: 'manual', createdAt: new Date().toISOString() },
      { id: 'target-2', tenantId: 'tenant-acme-corp', name: 'Bruno Lima', email: 'bruno.lima@acme.com', department: 'Vendas', position: 'Gerente', status: 'active', source: 'manual', createdAt: new Date().toISOString() },
      { id: 'target-3', tenantId: 'tenant-acme-corp', name: 'Carla Mendes', email: 'carla.mendes@acme.com', department: 'RH', position: 'Coordenadora', status: 'active', source: 'manual', createdAt: new Date().toISOString() },
      { id: 'target-4', tenantId: 'tenant-global-bank', name: 'Daniel Rocha', email: 'daniel.rocha@globalbank.com.br', department: 'Compliance', position: 'Analista', status: 'active', source: 'manual', createdAt: new Date().toISOString() },
      { id: 'target-5', tenantId: 'tenant-global-bank', name: 'Elena Ferreira', email: 'elena.ferreira@globalbank.com.br', department: 'Operações', position: 'Supervisora', status: 'active', source: 'manual', createdAt: new Date().toISOString() },
      { id: 'target-6', tenantId: 'tenant-health-plus', name: 'Felipe Alves', email: 'felipe.alves@healthplus.com.br', department: 'TI', position: 'Técnico', status: 'active', source: 'manual', createdAt: new Date().toISOString() },
    ];

    for (const target of targets) {
      await kv.set(`target:${target.id}`, target);
      created.targets++;
    }

    // 4. TARGET GROUPS
    const targetGroups = [
      { id: 'group-1', tenantId: 'tenant-acme-corp', name: 'Equipe TI', description: 'Departamento de TI', targetIds: ['target-1'], createdAt: new Date().toISOString() },
      { id: 'group-2', tenantId: 'tenant-acme-corp', name: 'Gerentes', description: 'Todos os gerentes', targetIds: ['target-2'], createdAt: new Date().toISOString() },
      { id: 'group-3', tenantId: 'tenant-global-bank', name: 'Compliance', description: 'Equipe de compliance', targetIds: ['target-4', 'target-5'], createdAt: new Date().toISOString() },
    ];

    for (const group of targetGroups) {
      await kv.set(`target-group:${group.id}`, group);
      created.targetGroups++;
    }

    // 5. CAMPAIGNS
    const campaigns = [
      {
        id: 'campaign-1',
        tenantId: 'tenant-acme-corp',
        name: 'Campanha Q1 2026 - Office 365',
        templateId: 'template-office365',
        targetGroupIds: ['group-1', 'group-2'],
        status: 'completed',
        type: 'standard',
        scheduledAt: null,
        createdBy: 'João Silva',
        stats: { sent: 150, opened: 98, clicked: 45, submitted: 12 },
        createdAt: new Date('2026-01-15').toISOString(),
      },
      {
        id: 'campaign-2',
        tenantId: 'tenant-acme-corp',
        name: 'Teste RH - Contracheque',
        templateId: 'template-payroll',
        targetGroupIds: ['group-1'],
        status: 'running',
        type: 'standard',
        scheduledAt: null,
        createdBy: 'João Silva',
        stats: { sent: 85, opened: 62, clicked: 28, submitted: 8 },
        createdAt: new Date('2026-03-01').toISOString(),
      },
      {
        id: 'campaign-3',
        tenantId: 'tenant-global-bank',
        name: 'Segurança Financeira 2026',
        templateId: 'template-urgent-ceo',
        targetGroupIds: ['group-3'],
        status: 'completed',
        type: 'standard',
        scheduledAt: null,
        createdBy: 'Maria Santos',
        stats: { sent: 220, opened: 185, clicked: 67, submitted: 15 },
        createdAt: new Date('2026-02-10').toISOString(),
      },
      {
        id: 'campaign-4',
        tenantId: 'tenant-health-plus',
        name: 'Campanha Saúde Digital',
        templateId: 'template-office365',
        targetGroupIds: [],
        status: 'scheduled',
        type: 'standard',
        scheduledAt: new Date('2026-04-01').toISOString(),
        createdBy: 'Pedro Oliveira',
        stats: { sent: 0, opened: 0, clicked: 0, submitted: 0 },
        createdAt: new Date('2026-03-05').toISOString(),
      },
    ];

    for (const campaign of campaigns) {
      await kv.set(`campaign:${campaign.id}`, campaign);
      created.campaigns++;
    }

    // 6. TRAININGS
    const trainings = [
      {
        id: 'training-1',
        tenantId: null,
        title: 'Introdução à Segurança da Informação',
        description: 'Fundamentos básicos de segurança digital e proteção de dados corporativos.',
        type: 'video',
        duration: 25,
        category: 'Básico',
        enrolledCount: 450,
        completedCount: 387,
        averageScore: 85,
        mediaUrl: 'https://example.com/videos/intro-security.mp4',
        createdAt: new Date('2026-01-01').toISOString(),
      },
      {
        id: 'training-2',
        tenantId: null,
        title: 'Identificando Ataques de Phishing',
        description: 'Aprenda a reconhecer e-mails maliciosos e técnicas de phishing avançadas.',
        type: 'video',
        duration: 30,
        category: 'Phishing',
        enrolledCount: 520,
        completedCount: 445,
        averageScore: 78,
        mediaUrl: 'https://example.com/videos/phishing-detection.mp4',
        createdAt: new Date('2026-01-15').toISOString(),
      },
      {
        id: 'training-3',
        tenantId: null,
        title: 'Segurança em Dispositivos Móveis',
        description: 'Boas práticas para proteger smartphones e tablets corporativos.',
        type: 'slides',
        duration: 20,
        category: 'Intermediário',
        enrolledCount: 280,
        completedCount: 235,
        averageScore: 82,
        mediaUrl: 'https://example.com/slides/mobile-security.pdf',
        createdAt: new Date('2026-02-01').toISOString(),
      },
      {
        id: 'training-4',
        tenantId: null,
        title: 'LGPD na Prática',
        description: 'Entenda as obrigações da Lei Geral de Proteção de Dados e como aplicá-la no dia a dia.',
        type: 'video',
        duration: 40,
        category: 'LGPD',
        enrolledCount: 650,
        completedCount: 580,
        averageScore: 88,
        mediaUrl: 'https://example.com/videos/lgpd-practical.mp4',
        createdAt: new Date('2026-02-10').toISOString(),
      },
      {
        id: 'training-5',
        tenantId: null,
        title: 'Engenharia Social e Manipulação',
        description: 'Técnicas de manipulação psicológica e como se proteger contra ataques de engenharia social.',
        type: 'video',
        duration: 35,
        category: 'Engenharia Social',
        enrolledCount: 420,
        completedCount: 365,
        averageScore: 76,
        mediaUrl: 'https://example.com/videos/social-engineering.mp4',
        createdAt: new Date('2026-02-20').toISOString(),
      },
      {
        id: 'training-6',
        tenantId: 'tenant-acme-corp',
        title: 'Políticas de Segurança Acme Corp',
        description: 'Treinamento específico sobre as políticas internas de segurança da Acme Corporation.',
        type: 'slides',
        duration: 15,
        category: 'Compliance',
        enrolledCount: 150,
        completedCount: 142,
        averageScore: 92,
        mediaUrl: 'https://example.com/slides/acme-policies.pdf',
        createdAt: new Date('2026-03-01').toISOString(),
      },
    ];

    for (const training of trainings) {
      await kv.set(`training:${training.id}`, training);
      created.trainings++;
    }

    // 7. CERTIFICATES
    const certificates = [
      {
        id: 'cert-1',
        tenantId: 'tenant-acme-corp',
        userId: 'target-1',
        userName: 'Ana Costa',
        userEmail: 'ana.costa@acme.com',
        trainingId: 'training-1',
        trainingTitle: 'Introdução à Segurança da Informação',
        completedAt: new Date('2026-03-05T14:30:00Z').toISOString(),
        issuedAt: new Date('2026-03-05T14:35:00Z').toISOString(),
        certificateCode: 'CERT-2026-ABC123',
        score: 95,
        templateId: 'default',
        status: 'issued',
      },
      {
        id: 'cert-2',
        tenantId: 'tenant-acme-corp',
        userId: 'target-2',
        userName: 'Bruno Lima',
        userEmail: 'bruno.lima@acme.com',
        trainingId: 'training-2',
        trainingTitle: 'Identificando Ataques de Phishing',
        completedAt: new Date('2026-03-04T10:15:00Z').toISOString(),
        issuedAt: new Date('2026-03-04T10:20:00Z').toISOString(),
        certificateCode: 'CERT-2026-DEF456',
        score: 88,
        templateId: 'default',
        status: 'issued',
      },
      {
        id: 'cert-3',
        tenantId: 'tenant-global-bank',
        userId: 'target-4',
        userName: 'Daniel Rocha',
        userEmail: 'daniel.rocha@globalbank.com.br',
        trainingId: 'training-4',
        trainingTitle: 'LGPD na Prática',
        completedAt: new Date('2026-03-03T16:45:00Z').toISOString(),
        issuedAt: new Date('2026-03-03T16:50:00Z').toISOString(),
        certificateCode: 'CERT-2026-GHI789',
        score: 92,
        templateId: 'default',
        status: 'issued',
      },
    ];

    for (const cert of certificates) {
      await kv.set(`certificate:${cert.id}`, cert);
      created.certificates++;
    }

    // 8. LANDING PAGES
    const landingPages = [
      {
        id: 'landing-1',
        tenantId: null,
        name: 'Login Office 365',
        description: 'Página de login falsa do Office 365',
        url: 'https://login-office365.example.com',
        type: 'credential_harvesting',
        template: 'office365',
        htmlContent: '<html><body><h1>Office 365 Login</h1></body></html>',
        cssContent: 'body { font-family: Arial; }',
        jsContent: '',
        captureFields: ['email', 'password'],
        capturesCount: 45,
        clicksCount: 150,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const lp of landingPages) {
      await kv.set(`landing-page:${lp.id}`, lp);
      created.landingPages++;
    }

    // 9. AUTOMATIONS
    const automations = [
      {
        id: 'automation-1',
        tenantId: 'tenant-acme-corp',
        name: 'Treinamento Automático após Comprometimento',
        description: 'Envia automaticamente um treinamento quando um usuário cai em phishing',
        trigger: 'user_compromised',
        conditions: { minScore: 0, maxScore: 50 },
        actions: [{ type: 'enroll_training', trainingId: 'training-2' }],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const automation of automations) {
      await kv.set(`automation:${automation.id}`, automation);
      created.automations++;
    }

    console.log("✅ Seed concluído com sucesso:", created);

    return c.json({
      success: true,
      message: "Database seeded successfully",
      created,
    });

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return c.json(
      { error: "Failed to seed database", details: String(error) },
      500
    );
  }
});

// =====================================================
// ANALYTICS - Dashboard Avançado
// =====================================================

// Obter métricas de analytics
app.get("/make-server-99a65fc7/analytics/metrics", async (c) => {
  try {
    const tenantId = c.req.query("tenantId");
    const timeRange = c.req.query("timeRange") || "30d"; // 7d, 30d, 90d, 1y
    
    // Buscar todas as campanhas para calcular métricas
    const campaigns = await kv.getByPrefix("campaign:");
    const filteredCampaigns = tenantId 
      ? campaigns.filter((camp: any) => camp.tenantId === tenantId)
      : campaigns;
    
    // Buscar eventos de tracking
    const events = await kv.getByPrefix("tracking-event:");
    
    // Calcular métricas agregadas
    const totalSent = filteredCampaigns.reduce((sum: number, c: any) => sum + (c.stats?.sent || 0), 0);
    const totalOpened = filteredCampaigns.reduce((sum: number, c: any) => sum + (c.stats?.opened || 0), 0);
    const totalClicked = filteredCampaigns.reduce((sum: number, c: any) => sum + (c.stats?.clicked || 0), 0);
    const totalSubmitted = filteredCampaigns.reduce((sum: number, c: any) => sum + (c.stats?.submitted || 0), 0);
    
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const submitRate = totalSent > 0 ? (totalSubmitted / totalSent) * 100 : 0;
    
    return c.json({
      overview: {
        totalSent,
        totalOpened,
        totalClicked,
        totalSubmitted,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
        submitRate: submitRate.toFixed(2),
      },
      campaigns: filteredCampaigns.length,
      timeRange,
    });
  } catch (error) {
    console.error("Error fetching analytics metrics:", error);
    return c.json({ error: "Failed to fetch analytics metrics", details: String(error) }, 500);
  }
});

// Obter dados de séries temporais para gráficos
app.get("/make-server-99a65fc7/analytics/timeseries", async (c) => {
  try {
    const tenantId = c.req.query("tenantId");
    const timeRange = c.req.query("timeRange") || "30d";
    
    // Buscar eventos de tracking
    const events = await kv.getByPrefix("tracking-event:");
    
    // Agrupar por data
    const timeSeriesData: any = {};
    
    events.forEach((event: any) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!timeSeriesData[date]) {
        timeSeriesData[date] = { date, opened: 0, clicked: 0, submitted: 0 };
      }
      
      if (event.type === 'email_opened') timeSeriesData[date].opened++;
      if (event.type === 'link_clicked') timeSeriesData[date].clicked++;
      if (event.type === 'data_submitted') timeSeriesData[date].submitted++;
    });
    
    const sortedData = Object.values(timeSeriesData).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );
    
    return c.json({ timeSeries: sortedData });
  } catch (error) {
    console.error("Error fetching timeseries data:", error);
    return c.json({ error: "Failed to fetch timeseries data", details: String(error) }, 500);
  }
});

// Obter métricas por departamento
app.get("/make-server-99a65fc7/analytics/by-department", async (c) => {
  try {
    const tenantId = c.req.query("tenantId");
    
    const targets = await kv.getByPrefix("target:");
    const events = await kv.getByPrefix("tracking-event:");
    
    // Agrupar por departamento
    const deptMetrics: any = {};
    
    targets.forEach((target: any) => {
      if (tenantId && target.tenantId !== tenantId) return;
      
      const dept = target.department || 'Sem Departamento';
      if (!deptMetrics[dept]) {
        deptMetrics[dept] = {
          department: dept,
          total: 0,
          clicked: 0,
          submitted: 0,
          clickRate: 0,
        };
      }
      
      deptMetrics[dept].total++;
      
      // Contar eventos deste target
      const targetEvents = events.filter((e: any) => e.targetEmail === target.email);
      const clicks = targetEvents.filter((e: any) => e.type === 'link_clicked').length;
      const submissions = targetEvents.filter((e: any) => e.type === 'data_submitted').length;
      
      deptMetrics[dept].clicked += clicks > 0 ? 1 : 0;
      deptMetrics[dept].submitted += submissions > 0 ? 1 : 0;
    });
    
    // Calcular taxas
    Object.values(deptMetrics).forEach((dept: any) => {
      dept.clickRate = dept.total > 0 ? ((dept.clicked / dept.total) * 100).toFixed(2) : 0;
    });
    
    return c.json({ departments: Object.values(deptMetrics) });
  } catch (error) {
    console.error("Error fetching department metrics:", error);
    return c.json({ error: "Failed to fetch department metrics", details: String(error) }, 500);
  }
});

// =====================================================
// TEMPLATE LIBRARY - Galeria de Templates
// =====================================================

// Buscar templates por categoria
app.get("/make-server-99a65fc7/template-library", async (c) => {
  try {
    const category = c.req.query("category");
    const difficulty = c.req.query("difficulty");
    const search = c.req.query("search");
    
    let templates = await kv.getByPrefix("template-lib:");
    
    // Filtros
    if (category && category !== 'all') {
      templates = templates.filter((t: any) => t.category === category);
    }
    
    if (difficulty) {
      templates = templates.filter((t: any) => t.difficulty === difficulty);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter((t: any) => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return c.json({ templates: templates || [] });
  } catch (error) {
    console.error("Error fetching template library:", error);
    return c.json({ error: "Failed to fetch template library", details: String(error) }, 500);
  }
});

// Clonar template da biblioteca para uso
app.post("/make-server-99a65fc7/template-library/:id/clone", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const libraryTemplate = await kv.get(`template-lib:${id}`);
    if (!libraryTemplate) {
      return c.json({ error: "Template not found in library" }, 404);
    }
    
    // Criar novo template baseado no da biblioteca
    const newId = `template-${Date.now()}`;
    const newTemplate = {
      ...libraryTemplate,
      id: newId,
      tenantId: body.tenantId,
      name: body.name || `${libraryTemplate.name} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`template:${newId}`, newTemplate);
    return c.json(newTemplate, 201);
  } catch (error) {
    console.error("Error cloning template:", error);
    return c.json({ error: "Failed to clone template", details: String(error) }, 500);
  }
});

// =====================================================
// CAMPAIGN SCHEDULING - Agendamento de Campanhas
// =====================================================

// Listar campanhas agendadas
app.get("/make-server-99a65fc7/scheduled-campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("campaign:");
    
    // Filtrar apenas campanhas agendadas
    const scheduled = campaigns.filter((c: any) => 
      c.status === 'scheduled' && c.scheduledAt
    );
    
    // Ordenar por data de agendamento
    scheduled.sort((a: any, b: any) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    
    return c.json({ campaigns: scheduled });
  } catch (error) {
    console.error("Error fetching scheduled campaigns:", error);
    return c.json({ error: "Failed to fetch scheduled campaigns", details: String(error) }, 500);
  }
});

// Criar agendamento recorrente
app.post("/make-server-99a65fc7/schedule-recurring", async (c) => {
  try {
    const body = await c.req.json();
    const id = `schedule-${Date.now()}`;
    
    const schedule = {
      id,
      tenantId: body.tenantId,
      name: body.name,
      templateId: body.templateId,
      targetGroupIds: body.targetGroupIds,
      recurrence: body.recurrence, // daily, weekly, monthly
      startDate: body.startDate,
      endDate: body.endDate || null,
      time: body.time, // HH:mm
      timezone: body.timezone || 'America/Sao_Paulo',
      status: 'active',
      lastExecuted: null,
      nextExecution: body.startDate,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`schedule:${id}`, schedule);
    return c.json(schedule, 201);
  } catch (error) {
    console.error("Error creating recurring schedule:", error);
    return c.json({ error: "Failed to create recurring schedule", details: String(error) }, 500);
  }
});

// =====================================================
// GAMIFICATION - Sistema de Gamificação
// =====================================================

// Obter badges/conquistas do usuário
app.get("/make-server-99a65fc7/gamification/badges/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    const userBadges = await kv.get(`user-badges:${userId}`) || {
      userId,
      badges: [],
      points: 0,
      level: 1,
    };
    
    return c.json(userBadges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return c.json({ error: "Failed to fetch user badges", details: String(error) }, 500);
  }
});

// Atribuir badge ao usuário
app.post("/make-server-99a65fc7/gamification/award-badge", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, badgeId, reason } = body;
    
    let userBadges = await kv.get(`user-badges:${userId}`) || {
      userId,
      badges: [],
      points: 0,
      level: 1,
    };
    
    // Verificar se já tem o badge
    if (!userBadges.badges.find((b: any) => b.badgeId === badgeId)) {
      const badge = {
        badgeId,
        awardedAt: new Date().toISOString(),
        reason,
      };
      
      userBadges.badges.push(badge);
      userBadges.points += 100; // +100 pontos por badge
      
      // Calcular nível (a cada 500 pontos)
      userBadges.level = Math.floor(userBadges.points / 500) + 1;
      
      await kv.set(`user-badges:${userId}`, userBadges);
    }
    
    return c.json(userBadges);
  } catch (error) {
    console.error("Error awarding badge:", error);
    return c.json({ error: "Failed to award badge", details: String(error) }, 500);
  }
});

// Obter ranking por departamento
app.get("/make-server-99a65fc7/gamification/rankings", async (c) => {
  try {
    const tenantId = c.req.query("tenantId");
    const type = c.req.query("type") || "department"; // department, individual
    
    const targets = await kv.getByPrefix("target:");
    const events = await kv.getByPrefix("tracking-event:");
    
    let rankings: any[] = [];
    
    if (type === "department") {
      const deptScores: any = {};
      
      targets.forEach((target: any) => {
        if (tenantId && target.tenantId !== tenantId) return;
        
        const dept = target.department || 'Sem Departamento';
        if (!deptScores[dept]) {
          deptScores[dept] = {
            name: dept,
            score: 0,
            avoided: 0,
            failed: 0,
          };
        }
        
        // Contar sucessos (não clicou) e falhas (clicou)
        const targetEvents = events.filter((e: any) => e.targetEmail === target.email);
        const clicked = targetEvents.some((e: any) => e.type === 'link_clicked');
        
        if (clicked) {
          deptScores[dept].failed++;
          deptScores[dept].score -= 10; // -10 por falha
        } else {
          deptScores[dept].avoided++;
          deptScores[dept].score += 20; // +20 por evitar
        }
      });
      
      rankings = Object.values(deptScores).sort((a: any, b: any) => b.score - a.score);
    }
    
    return c.json({ rankings });
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return c.json({ error: "Failed to fetch rankings", details: String(error) }, 500);
  }
});

// =====================================================
// REPORTS - Relatórios Exportáveis
// =====================================================

// Gerar relatório executivo
app.post("/make-server-99a65fc7/reports/generate", async (c) => {
  try {
    const body = await c.req.json();
    const { tenantId, campaignIds, dateRange, format } = body;
    
    const reportId = `report-${Date.now()}`;
    
    // Buscar dados
    const campaigns = await kv.getByPrefix("campaign:");
    const filteredCampaigns = campaigns.filter((c: any) => 
      (!tenantId || c.tenantId === tenantId) &&
      (!campaignIds || campaignIds.includes(c.id))
    );
    
    // Calcular estatísticas
    const totalSent = filteredCampaigns.reduce((sum: number, c: any) => sum + (c.stats?.sent || 0), 0);
    const totalClicked = filteredCampaigns.reduce((sum: number, c: any) => sum + (c.stats?.clicked || 0), 0);
    
    const report = {
      id: reportId,
      tenantId,
      type: 'executive',
      format: format || 'pdf',
      dateRange,
      summary: {
        totalCampaigns: filteredCampaigns.length,
        totalSent,
        totalClicked,
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0,
      },
      campaigns: filteredCampaigns,
      generatedAt: new Date().toISOString(),
      downloadUrl: `/api/reports/${reportId}/download`,
    };
    
    await kv.set(`report:${reportId}`, report);
    
    return c.json({ report });
  } catch (error) {
    console.error("Error generating report:", error);
    return c.json({ error: "Failed to generate report", details: String(error) }, 500);
  }
});

// Listar relatórios gerados
app.get("/make-server-99a65fc7/reports", async (c) => {
  try {
    const tenantId = c.req.query("tenantId");
    
    let reports = await kv.getByPrefix("report:");
    
    if (tenantId) {
      reports = reports.filter((r: any) => r.tenantId === tenantId);
    }
    
    reports.sort((a: any, b: any) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    
    return c.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return c.json({ error: "Failed to fetch reports", details: String(error) }, 500);
  }
});

// =====================================================
// NOTIFICATIONS - Sistema de Notificações
// =====================================================

// Obter notificações do usuário
app.get("/make-server-99a65fc7/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    notifications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ error: "Failed to fetch notifications", details: String(error) }, 500);
  }
});

// Criar notificação
app.post("/make-server-99a65fc7/notifications", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, type, title, message, data } = body;
    
    const id = `notification:${userId}:${Date.now()}`;
    
    const notification = {
      id,
      userId,
      type, // info, success, warning, error, phishing_alert
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(id, notification);
    
    return c.json(notification, 201);
  } catch (error) {
    console.error("Error creating notification:", error);
    return c.json({ error: "Failed to create notification", details: String(error) }, 500);
  }
});

// Marcar notificação como lida
app.put("/make-server-99a65fc7/notifications/:id/read", async (c) => {
  try {
    const id = c.req.param("id");
    
    const notification = await kv.get(id);
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }
    
    notification.read = true;
    notification.readAt = new Date().toISOString();
    
    await kv.set(id, notification);
    
    return c.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return c.json({ error: "Failed to mark notification as read", details: String(error) }, 500);
  }
});

// =====================================================
// AI CONTENT GENERATOR - Gerador de Conteúdo com IA
// =====================================================

// Gerar template com IA (mock)
app.post("/make-server-99a65fc7/ai/generate-template", async (c) => {
  try {
    const body = await c.req.json();
    const { category, difficulty, language, customInstructions } = body;
    
    // Mock de geração com IA
    const templates = {
      banking: {
        basic: {
          subject: "Ação Necessária: Confirme sua Conta",
          body: "<p>Prezado cliente,</p><p>Detectamos atividade incomum em sua conta. Por favor, confirme suas informações clicando no link abaixo:</p><p><a href='{{.TrackingURL}}'>Confirmar Agora</a></p>",
        },
      },
      hr: {
        basic: {
          subject: "Atualização: Política de Benefícios",
          body: "<p>Olá {{.Nome}},</p><p>A área de RH atualizou a política de benefícios. Acesse o documento clicando abaixo:</p><p><a href='{{.TrackingURL}}'>Ver Documento</a></p>",
        },
      },
    };
    
    const generated = templates[category as keyof typeof templates]?.[difficulty as 'basic'] || {
      subject: `Template ${category} - ${difficulty}`,
      body: `<p>Conteúdo gerado automaticamente para ${category}</p>`,
    };
    
    return c.json({
      success: true,
      template: {
        ...generated,
        category,
        difficulty,
        language,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating template with AI:", error);
    return c.json({ error: "Failed to generate template", details: String(error) }, 500);
  }
});

// Analisar template com IA
app.post("/make-server-99a65fc7/ai/analyze-template", async (c) => {
  try {
    const body = await c.req.json();
    const { subject, bodyHtml } = body;
    
    // Mock de análise com IA
    const analysis = {
      urgencyScore: Math.floor(Math.random() * 100),
      trustScore: Math.floor(Math.random() * 100),
      effectiveness: Math.floor(Math.random() * 100),
      suggestions: [
        "Adicione mais senso de urgência ao assunto",
        "Inclua uma chamada para ação mais clara",
        "Use personalização com variáveis dinâmicas",
      ],
      strengths: [
        "Tom profissional adequado",
        "Estrutura clara e objetiva",
      ],
      weaknesses: [
        "Falta de elementos visuais",
        "Assunto poderia ser mais persuasivo",
      ],
    };
    
    return c.json({ analysis });
  } catch (error) {
    console.error("Error analyzing template:", error);
    return c.json({ error: "Failed to analyze template", details: String(error) }, 500);
  }
});

// =====================================================
// AUDIT LOGS - Trilha de Auditoria
// =====================================================

// Criar log de auditoria
app.post("/make-server-99a65fc7/audit-logs", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, userName, action, resource, resourceId, details, ipAddress } = body;
    
    const id = `audit-log:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const log = {
      id,
      userId,
      userName,
      action, // create, update, delete, view, export, login, logout
      resource, // campaign, template, target, settings, etc
      resourceId,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    
    await kv.set(id, log);
    
    return c.json(log, 201);
  } catch (error) {
    console.error("Error creating audit log:", error);
    return c.json({ error: "Failed to create audit log", details: String(error) }, 500);
  }
});

// Buscar logs de auditoria
app.get("/make-server-99a65fc7/audit-logs", async (c) => {
  try {
    const userId = c.req.query("userId");
    const action = c.req.query("action");
    const resource = c.req.query("resource");
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");
    
    let logs = await kv.getByPrefix("audit-log:");
    
    // Filtros
    if (userId) {
      logs = logs.filter((l: any) => l.userId === userId);
    }
    
    if (action) {
      logs = logs.filter((l: any) => l.action === action);
    }
    
    if (resource) {
      logs = logs.filter((l: any) => l.resource === resource);
    }
    
    if (startDate) {
      logs = logs.filter((l: any) => new Date(l.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      logs = logs.filter((l: any) => new Date(l.timestamp) <= new Date(endDate));
    }
    
    logs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return c.json({ logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return c.json({ error: "Failed to fetch audit logs", details: String(error) }, 500);
  }
});

// =====================================================
// TRACKING EVENTS - Eventos de Rastreamento
// =====================================================

// Criar evento de tracking
app.post("/make-server-99a65fc7/tracking-events", async (c) => {
  try {
    const body = await c.req.json();
    const { campaignId, targetEmail, type, metadata } = body;
    
    const id = `tracking-event:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const event = {
      id,
      campaignId,
      targetEmail,
      type, // email_sent, email_opened, link_clicked, data_submitted
      metadata,
      timestamp: new Date().toISOString(),
    };
    
    await kv.set(id, event);
    
    // Atualizar estatísticas da campanha
    const campaign = await kv.get(`campaign:${campaignId}`);
    if (campaign) {
      if (!campaign.stats) {
        campaign.stats = { sent: 0, opened: 0, clicked: 0, submitted: 0 };
      }
      
      if (type === 'email_sent') campaign.stats.sent++;
      if (type === 'email_opened') campaign.stats.opened++;
      if (type === 'link_clicked') campaign.stats.clicked++;
      if (type === 'data_submitted') campaign.stats.submitted++;
      
      await kv.set(`campaign:${campaignId}`, campaign);
    }
    
    return c.json(event, 201);
  } catch (error) {
    console.error("Error creating tracking event:", error);
    return c.json({ error: "Failed to create tracking event", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);