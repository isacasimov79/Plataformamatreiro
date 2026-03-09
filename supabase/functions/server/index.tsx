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

    // 3. TARGETS (Alvos)
    const targets = [
      { id: 'target-1', tenantId: 'tenant-acme-corp', firstName: 'Ana', lastName: 'Costa', email: 'ana.costa@acme.com', department: 'TI', position: 'Analista', phone: '+5511987654321', createdAt: new Date().toISOString() },
      { id: 'target-2', tenantId: 'tenant-acme-corp', firstName: 'Bruno', lastName: 'Lima', email: 'bruno.lima@acme.com', department: 'Vendas', position: 'Gerente', phone: '+5511987654322', createdAt: new Date().toISOString() },
      { id: 'target-3', tenantId: 'tenant-acme-corp', firstName: 'Carla', lastName: 'Mendes', email: 'carla.mendes@acme.com', department: 'RH', position: 'Coordenadora', phone: '+5511987654323', createdAt: new Date().toISOString() },
      { id: 'target-4', tenantId: 'tenant-global-bank', firstName: 'Daniel', lastName: 'Rocha', email: 'daniel.rocha@globalbank.com.br', department: 'Compliance', position: 'Analista', phone: '+5511987654324', createdAt: new Date().toISOString() },
      { id: 'target-5', tenantId: 'tenant-global-bank', firstName: 'Elena', lastName: 'Ferreira', email: 'elena.ferreira@globalbank.com.br', department: 'Operações', position: 'Supervisora', phone: '+5511987654325', createdAt: new Date().toISOString() },
      { id: 'target-6', tenantId: 'tenant-health-plus', firstName: 'Felipe', lastName: 'Alves', email: 'felipe.alves@healthplus.com.br', department: 'TI', position: 'Técnico', phone: '+5511987654326', createdAt: new Date().toISOString() },
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

Deno.serve(app.fetch);