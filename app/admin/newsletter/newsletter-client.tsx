"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Send, Sparkles, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NewsletterSubscriberItem {
  id: string;
  email: string;
  full_name: string | null;
  locale: string | null;
  country_code: string | null;
  timezone: string | null;
  location_consent: boolean;
  status: "subscribed" | "unsubscribed";
  subscribed_at: string;
  unsubscribed_at: string | null;
}

interface NewsletterCampaignItem {
  id: string;
  title: string;
  subject: string;
  template_type: CampaignTemplateType;
  audience_country_code: string | null;
  status: "draft" | "sent";
  recipients_count: number;
  successful_sends: number;
  failed_sends: number;
  sent_at: string | null;
  created_at: string;
}

interface NewsletterClientProps {
  initialSubscribers: NewsletterSubscriberItem[];
  initialCampaigns: NewsletterCampaignItem[];
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    unsubscribed: number;
  };
  brandDefaults: {
    brandName: string;
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
}

type EditorMode = "visual" | "html";
type CampaignTemplateType = "promo" | "news" | "cta" | "surf_camp" | "accommodation" | "informative";

interface VisualComposerData {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  bodyText: string;
  featureTitle: string;
  featureDescription: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
}

const TEMPLATE_LABELS: Record<CampaignTemplateType, string> = {
  promo: "Promo",
  news: "Noticia",
  cta: "CTA",
  surf_camp: "Surf Camp",
  accommodation: "Hospedaje",
  informative: "Informativo",
};

const TEMPLATE_PRESETS: Record<
  CampaignTemplateType,
  {
    title: string;
    subject: string;
    previewText: string;
    visual: Partial<VisualComposerData>;
  }
> = {
  promo: {
    title: "Promo especial de temporada",
    subject: "Oferta limitada: reservá ahora y ahorrá",
    previewText: "Tarifas especiales por tiempo limitado",
    visual: {
      heroTitle: "Oferta especial en Mai Ke Kai",
      heroSubtitle: "Esta semana tenemos precios exclusivos",
      bodyText:
        "Lanzamos una promo para nuestra comunidad.\nReservá durante esta semana y obtené beneficios exclusivos.",
      featureTitle: "¿Qué incluye la promo?",
      featureDescription:
        "Descuento directo en hospedaje.\nBeneficio adicional en actividades seleccionadas.",
      ctaLabel: "Ver promoción",
    },
  },
  news: {
    title: "Novedades del hostel",
    subject: "Novedades y eventos de esta semana",
    previewText: "Todo lo nuevo en Mai Ke Kai",
    visual: {
      heroTitle: "Novedades de la semana",
      heroSubtitle: "Comunidad, eventos y noticias del hostel",
      bodyText:
        "Queremos compartirte las últimas novedades de Mai Ke Kai.\nTenemos nuevas actividades y experiencias para vos.",
      featureTitle: "Agenda destacada",
      featureDescription:
        "Evento sunset community night.\nNueva actividad guiada para huéspedes.",
      ctaLabel: "Ver novedades",
    },
  },
  cta: {
    title: "Campaña con llamado a la acción",
    subject: "Asegurá tu lugar hoy",
    previewText: "No te quedes sin cupo",
    visual: {
      heroTitle: "Tu próxima experiencia empieza acá",
      heroSubtitle: "Quedan pocos cupos para las próximas fechas",
      bodyText:
        "Si estabas pensando en venir, este es el mejor momento para reservar.\nTenemos fechas muy demandadas.",
      featureTitle: "Cupos limitados",
      featureDescription: "Reservá ahora para asegurar disponibilidad.",
      ctaLabel: "Reservar ahora",
    },
  },
  surf_camp: {
    title: "Promoción Surf Camp",
    subject: "Nuevo Surf Camp abierto: fechas confirmadas",
    previewText: "Clases, comunidad y pura vida",
    visual: {
      heroTitle: "Surf Camp Mai Ke Kai",
      heroSubtitle: "Entrená, surfeá y viví la experiencia completa",
      bodyText:
        "Abrimos nuevas fechas para el Surf Camp.\nIdeal para todos los niveles con instructores expertos.",
      featureTitle: "Incluye",
      featureDescription:
        "Alojamiento + clases + comunidad internacional.\nAsesoramiento para todos los niveles.",
      ctaLabel: "Quiero mi cupo",
      ctaUrl: "https://maikekaihouse.com/packages",
    },
  },
  accommodation: {
    title: "Campaña de hospedaje",
    subject: "Hospedate en Tamarindo con beneficios exclusivos",
    previewText: "Habitaciones y experiencias para tu próxima estadía",
    visual: {
      heroTitle: "Tu estadía en Tamarindo",
      heroSubtitle: "Habitaciones, comunidad y ubicación ideal",
      bodyText:
        "Tenemos disponibilidad para las próximas semanas.\nElegí tu tipo de habitación y viví una experiencia única.",
      featureTitle: "Beneficios de hospedarte con nosotros",
      featureDescription:
        "Ubicación estratégica.\nAmbiente social y staff local para ayudarte en todo.",
      ctaLabel: "Ver hospedaje",
      ctaUrl: "https://maikekaihouse.com/#rooms",
    },
  },
  informative: {
    title: "Email informativo",
    subject: "Actualización importante de Mai Ke Kai",
    previewText: "Te contamos las últimas novedades",
    visual: {
      heroTitle: "Información importante",
      heroSubtitle: "Actualización para nuestra comunidad",
      bodyText:
        "Te compartimos esta comunicación para mantenerte al día.\nGracias por ser parte de nuestra comunidad.",
      featureTitle: "Detalle",
      featureDescription: "Aquí podés sumar la información relevante que querés comunicar.",
      ctaLabel: "Más información",
    },
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatParagraphs(value: string): string {
  const text = escapeHtml(value).trim();
  if (!text) return "";

  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p style=\"margin:0 0 12px;\">${line}</p>`)
    .join("");
}

function buildVisualNewsletterHtml(input: VisualComposerData): string {
  const heroTitle = escapeHtml(input.heroTitle || "Latest news from our hostel");
  const heroSubtitle = escapeHtml(input.heroSubtitle || "Special offers, events and surf updates");
  const featureTitle = escapeHtml(input.featureTitle || "This week highlight");
  const featureDescription = formatParagraphs(
    input.featureDescription || "Add your promo, package or announcement here."
  );
  const body = formatParagraphs(input.bodyText || "Tell your subscribers what is new.");
  const footerNote = escapeHtml(input.footerNote || "Thank you for being part of our community.");
  const ctaLabel = escapeHtml(input.ctaLabel || "Book now");
  const ctaUrl = escapeHtml(input.ctaUrl || "https://maikekaihouse.com");
  const brandName = escapeHtml(input.brandName || "Mai Ke Kai Surf House");
  const logoBlock = input.logoUrl.trim()
    ? `<img src=\"${escapeHtml(input.logoUrl.trim())}\" alt=\"${brandName}\" style=\"max-width:140px;height:auto;display:block;\" />`
    : `<span style=\"font-size:18px;font-weight:700;color:#ffffff;\">${brandName}</span>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>${heroTitle}</title>
</head>
<body style=\"margin:0;padding:0;background:#f4f7fb;font-family:${escapeHtml(input.fontFamily)};\">
  <div style=\"max-width:620px;margin:24px auto;padding:0 12px;\">
    <div style=\"border-radius:16px;overflow:hidden;background:#ffffff;border:1px solid #e5e7eb;\">
      <div style=\"padding:24px;background:linear-gradient(140deg, ${escapeHtml(input.primaryColor)}, ${escapeHtml(input.accentColor)});\">
        ${logoBlock}
        <h1 style=\"margin:18px 0 8px;color:#ffffff;font-size:28px;line-height:1.2;\">${heroTitle}</h1>
        <p style=\"margin:0;color:#ecfeff;font-size:15px;line-height:1.5;\">${heroSubtitle}</p>
      </div>

      <div style=\"padding:24px 24px 14px;color:#1f2937;font-size:15px;line-height:1.65;\">
        ${body}
      </div>

      <div style=\"margin:0 24px 20px;padding:18px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;\">
        <h2 style=\"margin:0 0 8px;color:#0f172a;font-size:18px;\">${featureTitle}</h2>
        <div style=\"color:#334155;font-size:14px;line-height:1.6;\">${featureDescription}</div>
      </div>

      <div style=\"padding:0 24px 28px;\">
        <a href=\"${ctaUrl}\" style=\"display:inline-block;padding:12px 24px;border-radius:999px;text-decoration:none;background:${escapeHtml(input.primaryColor)};color:#ffffff;font-weight:700;font-size:14px;\">${ctaLabel}</a>
      </div>

      <div style=\"padding:16px 24px;background:#0f172a;\">
        <p style=\"margin:0;color:#cbd5e1;font-size:12px;line-height:1.5;\">${footerNote}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function NewsletterClient({
  initialSubscribers,
  initialCampaigns,
  stats,
  brandDefaults,
}: NewsletterClientProps) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("visual");
  const [templateType, setTemplateType] = useState<CampaignTemplateType>("informative");
  const [audienceCountry, setAudienceCountry] = useState<string>("ALL");
  const [formData, setFormData] = useState({
    title: TEMPLATE_PRESETS.informative.title,
    subject: TEMPLATE_PRESETS.informative.subject,
    previewText: TEMPLATE_PRESETS.informative.previewText,
    contentHtml: "<p>Hi surfer,</p><p>We have fresh updates from Mai Ke Kai for you.</p>",
  });
  const [visualData, setVisualData] = useState<VisualComposerData>({
    brandName: brandDefaults.brandName,
    logoUrl: brandDefaults.logoUrl,
    primaryColor: brandDefaults.primaryColor,
    accentColor: brandDefaults.accentColor,
    fontFamily: brandDefaults.fontFamily,
    heroTitle: TEMPLATE_PRESETS.informative.visual.heroTitle || "Información importante",
    heroSubtitle: TEMPLATE_PRESETS.informative.visual.heroSubtitle || "Actualización para nuestra comunidad",
    bodyText:
      TEMPLATE_PRESETS.informative.visual.bodyText ||
      "Te compartimos esta comunicación para mantenerte al día.",
    featureTitle: TEMPLATE_PRESETS.informative.visual.featureTitle || "Detalle",
    featureDescription:
      TEMPLATE_PRESETS.informative.visual.featureDescription ||
      "Aquí podés sumar la información relevante que querés comunicar.",
    ctaLabel: TEMPLATE_PRESETS.informative.visual.ctaLabel || "Más información",
    ctaUrl: TEMPLATE_PRESETS.informative.visual.ctaUrl || "https://maikekaihouse.com",
    footerNote: "You received this email because you subscribed to our updates.",
  });

  const generatedHtml = useMemo(() => buildVisualNewsletterHtml(visualData), [visualData]);

  const activeSubscribers = useMemo(
    () => subscribers.filter((item) => item.status === "subscribed"),
    [subscribers]
  );

  const availableCountries = useMemo(
    () =>
      Array.from(
        new Set(
          activeSubscribers
            .map((item) => item.country_code)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [activeSubscribers]
  );

  function applyTemplate(nextTemplate: CampaignTemplateType) {
    const preset = TEMPLATE_PRESETS[nextTemplate];

    setTemplateType(nextTemplate);
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      subject: preset.subject,
      previewText: preset.previewText,
    }));
    setVisualData((prev) => ({
      ...prev,
      ...preset.visual,
    }));
    toast.success(`Template ${TEMPLATE_LABELS[nextTemplate]} aplicado`);
  }

  async function refreshData() {
    const response = await fetch("/api/admin/newsletter");
    if (!response.ok) {
      throw new Error("Could not refresh newsletter data");
    }

    const payload = await response.json();
    setSubscribers(payload.subscribers || []);
    setCampaigns(payload.campaigns || []);
  }

  async function submitCampaign(sendNow: boolean) {
    setIsSubmitting(true);
    try {
      const contentHtmlToSend = editorMode === "visual" ? generatedHtml : formData.contentHtml;

      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          templateType,
          audienceCountry: audienceCountry === "ALL" ? undefined : audienceCountry,
          contentHtml: contentHtmlToSend,
          sendNow,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Could not save campaign");
      }

      toast.success(sendNow ? "Campaign sent successfully" : "Draft campaign saved");
      await refreshData();

      if (sendNow) {
        setFormData((prev) => ({
          ...prev,
          title: "",
          subject: "",
          previewText: "",
        }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Newsletter</h1>
        <p className="text-muted-foreground">
          Editor no-code con templates, branding y segmentación geográfica opcional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {stats.totalSubscribers}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              {activeSubscribers.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unsubscribed</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <UserX className="w-5 h-5 text-destructive" />
              {stats.unsubscribed}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>New Campaign</CardTitle>
              <CardDescription>
                Audience: {activeSubscribers.length} active subscribers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={templateType} onValueChange={(value) => applyTemplate(value as CampaignTemplateType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Audience by country</Label>
                  <Select value={audienceCountry} onValueChange={setAudienceCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All countries</SelectItem>
                      {availableCountries.map((countryCode) => (
                        <SelectItem key={countryCode} value={countryCode}>
                          {countryCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previewText">Preview Text (optional)</Label>
                  <Input
                    id="previewText"
                    value={formData.previewText}
                    onChange={(e) => setFormData((prev) => ({ ...prev, previewText: e.target.value }))}
                    placeholder="Limited spots for this season"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="April Surf Camp Launch"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="New dates and early-bird prices"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Editor Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Use visual mode to design branded newsletters without writing HTML.
                    </p>
                  </div>
                  <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as EditorMode)}>
                    <TabsList>
                      <TabsTrigger value="visual">Visual</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {editorMode === "visual" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          value={visualData.brandName}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, brandName: e.target.value }))}
                          placeholder="Your hostel brand"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          value={visualData.logoUrl}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <Input
                          id="primaryColor"
                          type="color"
                          value={visualData.primaryColor}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <Input
                          id="accentColor"
                          type="color"
                          value={visualData.accentColor}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, accentColor: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">Typography</Label>
                        <Input
                          id="fontFamily"
                          value={visualData.fontFamily}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, fontFamily: e.target.value }))}
                          placeholder="'Poppins', 'Segoe UI', Arial, sans-serif"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heroTitle">Main Title</Label>
                      <Input
                        id="heroTitle"
                        value={visualData.heroTitle}
                        onChange={(e) => setVisualData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heroSubtitle">Subtitle</Label>
                      <Input
                        id="heroSubtitle"
                        value={visualData.heroSubtitle}
                        onChange={(e) => setVisualData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bodyText">Main Message</Label>
                      <Textarea
                        id="bodyText"
                        className="min-h-28"
                        value={visualData.bodyText}
                        onChange={(e) => setVisualData((prev) => ({ ...prev, bodyText: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="featureTitle">Feature Block Title</Label>
                        <Input
                          id="featureTitle"
                          value={visualData.featureTitle}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, featureTitle: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ctaLabel">CTA Button Label</Label>
                        <Input
                          id="ctaLabel"
                          value={visualData.ctaLabel}
                          onChange={(e) => setVisualData((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="featureDescription">Feature Block Description</Label>
                      <Textarea
                        id="featureDescription"
                        className="min-h-24"
                        value={visualData.featureDescription}
                        onChange={(e) => setVisualData((prev) => ({ ...prev, featureDescription: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ctaUrl">CTA URL</Label>
                      <Input
                        id="ctaUrl"
                        value={visualData.ctaUrl}
                        onChange={(e) => setVisualData((prev) => ({ ...prev, ctaUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footerNote">Footer Note</Label>
                      <Input
                        id="footerNote"
                        value={visualData.footerNote}
                        onChange={(e) => setVisualData((prev) => ({ ...prev, footerNote: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Visual Preview
                      </Label>
                      <div className="rounded-lg border border-border overflow-hidden bg-white">
                        <iframe title="Newsletter preview" srcDoc={generatedHtml} className="w-full h-105" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="contentHtml">HTML Content</Label>
                    <Textarea
                      id="contentHtml"
                      className="min-h-65 font-mono text-sm"
                      value={formData.contentHtml}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contentHtml: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => submitCampaign(false)} disabled={isSubmitting}>
                  Save Draft
                </Button>
                <Button onClick={() => submitCampaign(true)} disabled={isSubmitting || activeSubscribers.length === 0}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Campaign"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Latest 30 campaigns</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Recipients</TableHead>
                    <TableHead className="text-center">Sent</TableHead>
                    <TableHead className="text-center">Failed</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{TEMPLATE_LABELS[campaign.template_type]}</Badge>
                      </TableCell>
                      <TableCell>{campaign.audience_country_code || "All"}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.status === "sent" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{campaign.recipients_count}</TableCell>
                      <TableCell className="text-center">{campaign.successful_sends}</TableCell>
                      <TableCell className="text-center">{campaign.failed_sends}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>Latest 200 subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Geo Consent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.full_name || "-"}</TableCell>
                      <TableCell>{subscriber.locale || subscriber.timezone || "-"}</TableCell>
                      <TableCell>{subscriber.country_code || "-"}</TableCell>
                      <TableCell>{subscriber.location_consent ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === "subscribed" ? "default" : "outline"}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
