'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';

type AnalyticsData = {
  recentAnalytics: Array<{
    id: string;
    asset_id: string;
    variant: string;
    timestamp: string;
    response_time: number;
  }>;
  mostRequested: Array<{
    asset_id: string;
    variant: string;
    request_count: number;
    avg_response_time: number;
  }>;
  timestamp: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR<AnalyticsData>('/api/analytics', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 space-y-8 p-8 pt-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Badge variant="destructive" className="text-sm">
            Failed to load analytics
          </Badge>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 space-y-4 sm:space-y-8 p-2 sm:p-8 pt-4 sm:pt-6"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        {data && (
          <Badge variant="outline" className="text-sm w-fit">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(data.timestamp))} ago
          </Badge>
        )}
      </motion.div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Most Requested Assets
                <Badge variant="secondary" className="ml-auto">
                  {data?.mostRequested.length || 0} assets
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px] sm:w-auto">Asset ID</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Response Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {data?.mostRequested.map((asset) => (
                        <motion.tr
                          key={`${asset.asset_id}-${asset.variant}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell className="font-mono text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                            {asset.asset_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs sm:text-sm">
                              {asset.variant}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                              {asset.request_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs sm:text-sm ${getResponseTimeColor(asset.avg_response_time)}`}>
                              {Math.round(asset.avg_response_time)}ms
                            </span>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Recent Requests
                <Badge variant="secondary" className="ml-auto">
                  {data?.recentAnalytics.length || 0} requests
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px] sm:w-auto">Asset ID</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Response Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {data?.recentAnalytics.map((request) => (
                        <motion.tr
                          key={request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell className="font-mono text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                            {request.asset_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs sm:text-sm">
                              {request.variant}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                            {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs sm:text-sm ${getResponseTimeColor(request.response_time)}`}>
                              {request.response_time}ms
                            </span>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AnalyticsSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 space-y-4 sm:space-y-8 p-2 sm:p-8 pt-4 sm:pt-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <Skeleton className="h-8 sm:h-9 w-48 sm:w-64" />
        <Skeleton className="h-6 w-24 sm:w-32" />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 sm:h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-6">
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 sm:h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function getResponseTimeColor(time: number): string {
  if (time < 100) return 'text-green-500';
  if (time < 300) return 'text-yellow-500';
  return 'text-red-500';
} 