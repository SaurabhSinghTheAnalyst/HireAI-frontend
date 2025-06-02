
import { TrendingUp, Users, MapPin, Clock, Briefcase, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const DashboardStats = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Recruitment Dashboard</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Overview of your candidate database and recruitment insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">27%</span> of total candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Searches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Generated</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Skills in Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { skill: 'JavaScript', count: 456, percentage: 82 },
              { skill: 'Python', count: 389, percentage: 70 },
              { skill: 'React', count: 334, percentage: 60 },
              { skill: 'Node.js', count: 298, percentage: 54 },
              { skill: 'TypeScript', count: 267, percentage: 48 },
              { skill: 'AWS', count: 234, percentage: 42 }
            ].map((item) => (
              <div key={item.skill} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.skill}</span>
                  <span className="text-sm text-gray-500">{item.count} candidates</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { location: 'United Kingdom', count: 234, flag: '🇬🇧' },
              { location: 'Germany', count: 189, flag: '🇩🇪' },
              { location: 'France', count: 156, flag: '🇫🇷' },
              { location: 'Netherlands', count: 123, flag: '🇳🇱' },
              { location: 'Spain', count: 98, flag: '🇪🇸' },
              { location: 'Italy', count: 87, flag: '🇮🇹' }
            ].map((item) => (
              <div key={item.location} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{item.flag}</span>
                  <span className="font-medium">{item.location}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Work Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Remote</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">587</div>
                <div className="text-sm text-gray-500">47%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span>Hybrid</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">423</div>
                <div className="text-sm text-gray-500">34%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span>On-site</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">237</div>
                <div className="text-sm text-gray-500">19%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Available</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">342</div>
                <div className="text-sm text-gray-500">27%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Open to opportunities</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">578</div>
                <div className="text-sm text-gray-500">46%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full" />
                <span>Not looking</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">327</div>
                <div className="text-sm text-gray-500">26%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Senior (5+ years)</span>
              <div className="text-right">
                <div className="font-semibold">498</div>
                <div className="text-sm text-gray-500">40%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Mid-level (2-5 years)</span>
              <div className="text-right">
                <div className="font-semibold">436</div>
                <div className="text-sm text-gray-500">35%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Junior (0-2 years)</span>
              <div className="text-right">
                <div className="font-semibold">313</div>
                <div className="text-sm text-gray-500">25%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
