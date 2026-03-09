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

Deno.serve(app.fetch);