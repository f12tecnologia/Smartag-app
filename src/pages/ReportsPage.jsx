import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MousePointer, TrendingUp, BarChart, PieChart, FileDown, Calendar as CalendarIcon, Loader2, LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from '@/components/ReportPDF';
import { cn } from '@/lib/utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff7300', '#00C49F', '#FFBB28'];
const PIE_COLORS = ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)", "rgba(255, 206, 86, 0.8)", "rgba(75, 192, 192, 0.8)"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const engajamentoSemanalData = [
  { name: 'Seg', Visualizações: 3000, Cliques: 1500 },
  { name: 'Ter', Visualizações: 2000, Cliques: 1000 },
  { name: 'Qua', Visualizações: 9000, Cliques: 4500 },
  { name: 'Qui', Visualizações: 5000, Cliques: 2500 },
  { name: 'Sex', Visualizações: 4000, Cliques: 2000 },
  { name: 'Sáb', Visualizações: 4500, Cliques: 2250 },
  { name: 'Dom', Visualizações: 2500, Cliques: 1250 },
];

const origemDosCliquesData = [
  { name: 'Social Media', value: 33 },
  { name: 'Website', value: 25 },
  { name: 'Email', value: 25 },
  { name: 'Outros', value: 17 },
];

const conversoesMensaisData = [
  { name: 'Jan', Conversões: 300 },
  { name: 'Fev', Conversões: 450 },
  { name: 'Mar', Conversões: 400 },
  { name: 'Abr', Conversões: 350 },
  { name: 'Mai', Conversões: 600 },
];


const StatCard = ({ icon, title, value, subValue, isLoading }) => {
  const Icon = icon;
  return (
    <motion.div variants={itemVariants} className="metric-card">
      <div className="flex items-center gap-4">
        <Icon className="w-8 h-8 text-pink-400" />
        {isLoading ? (
          <div className="w-24 h-12 bg-gray-700/50 rounded animate-pulse"></div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subValue && <p className="text-gray-500 text-xs">{subValue}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, icon, children, isLoading, className = "" }) => {
  const Icon = icon;
  return (
     <motion.div variants={itemVariants} className={cn("url-card p-4 sm:p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-pink-400"/>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="h-64 sm:h-80">
        {isLoading ? (
          <div className="w-full h-full bg-gray-700/50 rounded animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        ) : children}
      </div>
    </motion.div>
  );
};

const ReportsPage = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState({ from: subDays(new Date(), 30), to: new Date() });
  const [urlFilter, setUrlFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUrls = async () => {
      setLoading(true);
      try {
        let query = supabase.from('qr_codes').select('*');

        if (date?.from) {
          query = query.gte('created_at', date.from.toISOString());
        }
        if (date?.to) {
          query = query.lte('created_at', date.to.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setUrls(data || []);
      } catch (error) {
        toast({
          title: "❌ Erro ao buscar dados",
          description: error.message,
          variant: "destructive",
        });
      }
      setLoading(false);
    };
    fetchUrls();
  }, [toast, date]);

  const filteredUrls = useMemo(() => {
    if (urlFilter === 'all') return urls;
    return urls.filter(url => url.id === urlFilter);
  }, [urls, urlFilter]);
  
  const totalUrls = filteredUrls.length;
  const totalClicks = filteredUrls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const avgClicks = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0;

  const clicksByUrl = useMemo(() => {
    return filteredUrls
      .filter(url => url.clicks > 0)
      .map(url => ({ name: url.title || url.url, clicks: url.clicks }))
      .sort((a, b) => a.clicks - b.clicks)
      .slice(0, 10);
  }, [filteredUrls]);

  const pdfData = {
    totalUrls,
    totalClicks,
    avgClicks,
    topUrls: clicksByUrl.slice(0, 5),
    period: `${date?.from ? format(date.from, "dd/MM/yy") : ''} - ${date?.to ? format(date.to, "dd/MM/yy") : ''}`,
    filterTitle: urlFilter === 'all' ? null : urls.find(u => u.id === urlFilter)?.title,
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold gradient-text">
            Relatórios de Performance
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full md:w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: ptBR })
                  )
                ) : (
                  <span>Escolha uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Select value={urlFilter} onValueChange={setUrlFilter}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Filtrar por URL..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as URLs</SelectItem>
              {urls.map(url => (
                <SelectItem key={url.id} value={url.id}>{url.title || url.url}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PDFDownloadLink
            document={<ReportPDF data={pdfData} />}
            fileName={`relatorio_qrcodes_${new Date().toISOString().split('T')[0]}.pdf`}
            className="w-full md:w-auto"
          >
            {({ blob, url, loading, error }) => (
              <Button className="w-full md:w-auto" disabled={loading}>
                <FileDown className="mr-2 h-4 w-4" />
                {loading ? 'Gerando...' : 'Baixar PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <StatCard icon={Users} title="Total de URLs" value={totalUrls} subValue="URLs no período" isLoading={loading} />
          <StatCard icon={MousePointer} title="Total de Cliques" value={totalClicks} subValue="Cliques no período" isLoading={loading} />
          <StatCard icon={TrendingUp} title="Média de Cliques" value={avgClicks} subValue="Cliques por URL" isLoading={loading} />
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <ChartCard title="Cliques por URL (Top 10 Menos Clicados)" icon={BarChart} isLoading={loading} className="lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={clicksByUrl} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#9CA3AF' }} style={{ fontSize: '12px' }}/>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} cursor={{fill: '#ffffff10'}}/>
                <Legend />
                <Bar dataKey="clicks" fill="#8884d8" name="Cliques" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribuição de Cliques (Top 10)" icon={PieChart} isLoading={loading} className="lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={clicksByUrl}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="clicks"
                  nameKey="name"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {clicksByUrl.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Engajamento Semanal" icon={BarChart} isLoading={false} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={engajamentoSemanalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} cursor={{fill: '#ffffff10'}}/>
                <Legend />
                <Bar dataKey="Visualizações" fill="rgba(126, 87, 194, 0.6)" />
                <Bar dataKey="Cliques" fill="rgba(220, 53, 69, 0.6)" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Origem dos Cliques" icon={PieChart} isLoading={false} className="lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={origemDosCliquesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {origemDosCliquesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Conversões Mensais" icon={LineChartIcon} isLoading={false} className="lg:col-span-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={conversoesMensaisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#E5E7EB' }} cursor={{fill: '#ffffff10'}}/>
                <Legend />
                <Line type="monotone" dataKey="Conversões" stroke="rgba(220, 53, 69, 0.8)" fill="rgba(220, 53, 69, 0.2)" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartCard>

        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;