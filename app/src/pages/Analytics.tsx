import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, Globe, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsData, responseTimes } from '@/data/mockData';

const timeRanges = ['7D', '30D', '90D'];

export default function Analytics() {
  const [activeRange, setActiveRange] = useState('30D');

  const totalDeployments = analyticsData.reduce((sum, d) => sum + d.deployments, 0);
  const avgResponseTime = Math.round(
    responseTimes.reduce((sum, r) => sum + r.time, 0) / responseTimes.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-[hsl(240_5%_55%)] mt-1">
            Deployment metrics and performance insights
          </p>
        </div>
        <div className="flex gap-1 bg-[hsl(240_8%_12%)] rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeRange === range
                  ? 'bg-[hsl(240_8%_18%)] text-white'
                  : 'text-[hsl(240_5%_55%)] hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Deployments</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalDeployments}</p>
            <p className="text-xs text-emerald-400 mt-1">+12% from last period</p>
          </CardContent>
        </Card>
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Avg Response</span>
            </div>
            <p className="text-2xl font-bold text-white">{avgResponseTime}ms</p>
            <p className="text-xs text-emerald-400 mt-1">-8ms from last period</p>
          </CardContent>
        </Card>
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">97.3%</p>
            <p className="text-xs text-emerald-400 mt-1">+1.2% from last period</p>
          </CardContent>
        </Card>
        <Card className="card-dark">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[hsl(240_5%_55%)] mb-2">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Requests</span>
            </div>
            <p className="text-2xl font-bold text-white">298K</p>
            <p className="text-xs text-emerald-400 mt-1">+23% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Deployments Chart */}
      <Card className="card-dark">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[hsl(25_95%_53%)]" />
            Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={hslToHex('25 95% 53%')} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={hslToHex('25 95% 53%')} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  }
                  stroke="hsl(240 5% 45%)"
                  tick={{ fill: 'hsl(240 5% 55%)', fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(240 5% 45%)"
                  tick={{ fill: 'hsl(240 5% 55%)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(240 12% 8%)',
                    border: '1px solid hsl(240 6% 18%)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="deployments"
                  stroke={hslToHex('25 95% 53%')}
                  strokeWidth={2}
                  fill="url(#deployGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Bars */}
        <Card className="card-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-[hsl(25_95%_53%)]" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {responseTimes.map((rt) => (
                <div key={rt.project} className="flex items-center gap-4">
                  <span className="text-sm text-white w-32 truncate flex-shrink-0">{rt.project}</span>
                  <div className="flex-1 h-7 bg-[hsl(240_8%_14%)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        rt.status === 'good'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : rt.status === 'slow'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{
                        width: `${Math.min((rt.time / 300) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium w-14 text-right flex-shrink-0 ${
                      rt.status === 'good'
                        ? 'text-emerald-400'
                        : rt.status === 'slow'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {rt.time > 0 ? `${rt.time}ms` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Rate Chart */}
        <Card className="card-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-[hsl(25_95%_53%)]" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }
                    stroke="hsl(240 5% 45%)"
                    tick={{ fill: 'hsl(240 5% 55%)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(240 5% 45%)"
                    tick={{ fill: 'hsl(240 5% 55%)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240 12% 8%)',
                      border: '1px solid hsl(240 6% 18%)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Bar dataKey="errors" fill={hslToHex('0 72% 51%')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Origins */}
      <Card className="card-dark">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Globe className="h-5 w-5 text-[hsl(25_95%_53%)]" />
            Request Origins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] relative overflow-hidden rounded-lg bg-[hsl(240_8%_10%)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-[600px]">
                {/* Dots on world map */}
                {[
                  { x: '18%', y: '35%', size: 6 }, // US West
                  { x: '25%', y: '32%', size: 8 }, // US East
                  { x: '45%', y: '25%', size: 7 }, // Europe
                  { x: '50%', y: '28%', size: 5 }, // Europe 2
                  { x: '55%', y: '35%', size: 6 }, // Middle East
                  { x: '65%', y: '30%', size: 8 }, // India
                  { x: '75%', y: '32%', size: 7 }, // Asia
                  { x: '85%', y: '38%', size: 6 }, // Japan
                  { x: '80%', y: '55%', size: 5 }, // Australia
                  { x: '48%', y: '50%', size: 5 }, // Africa
                  { x: '30%', y: '55%', size: 4 }, // Brazil
                  { x: '72%', y: '28%', size: 5 }, // SE Asia
                ].map((dot, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-[hsl(25_95%_53%)] animate-pulse"
                    style={{
                      left: dot.x,
                      top: dot.y,
                      width: dot.size,
                      height: dot.size,
                      opacity: 0.6 + Math.random() * 0.4,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
                {/* World map silhouette */}
                <svg
                  viewBox="0 0 1000 500"
                  className="absolute inset-0 w-full h-full opacity-10"
                >
                  <path
                    fill="currentColor"
                    className="text-[hsl(240_5%_55%)]"
                    d="M150,120 Q180,100 220,110 T300,100 Q350,90 400,110 T500,95 Q550,85 600,100 T700,90 Q750,80 800,95 T900,85 Q920,90 930,110 T920,150 Q900,180 850,200 T750,220 Q700,230 650,210 T550,225 Q500,235 450,220 T350,230 Q300,240 250,220 T150,210 Q120,200 110,170 T120,130 Q130,115 150,120Z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[
              { region: 'North America', pct: '42%', color: 'bg-[hsl(25_95%_53%)]' },
              { region: 'Europe', pct: '28%', color: 'bg-[hsl(25_80%_45%)]' },
              { region: 'Asia Pacific', pct: '22%', color: 'bg-[hsl(25_70%_40%)]' },
              { region: 'Other', pct: '8%', color: 'bg-[hsl(240_8%_30%)]' },
            ].map((r) => (
              <div key={r.region} className="text-center">
                <div className={`w-3 h-3 rounded-full ${r.color} mx-auto mb-1`} />
                <p className="text-xs text-[hsl(240_5%_55%)]">{r.region}</p>
                <p className="text-sm font-bold text-white">{r.pct}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v));
  const a = (s * Math.min(l, 100 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
