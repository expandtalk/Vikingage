import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { AdminDataManagement } from '../components/AdminDataManagement';
import { SecurityAuditDashboard } from '../components/SecurityAuditDashboard';
import { SignumManagement } from '../components/admin/SignumManagement';
import { AdminRoles } from '../components/admin/AdminRoles';
import { EntityEditor } from '../components/admin/entity-editor/EntityEditor';
import { AdminDiscussion } from '../components/admin/AdminDiscussion';
import { AdminSearchAnalytics } from '../components/admin/AdminSearchAnalytics';
import { UgcModerationQueue } from '../components/admin/UgcModerationQueue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Settings, Database, UserCog, Network, MessagesSquare, Search, Inbox } from "lucide-react";

// Åtkomstkontroll sker centralt i <RequireRole roles={['admin']}> (App.tsx).
const Admin = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8">
        {/* Admin header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link to="/welcome">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tillbaka till startsidan
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              <span className="text-lg font-semibold">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Admin functionality */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-white/10 border-white/20">
            <TabsTrigger value="content" className="data-[state=active]:bg-white/20 text-white">
              <Network className="h-4 w-4 mr-2" />
              Innehåll
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-white/20 text-white">
              <Database className="h-4 w-4 mr-2" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="signum" className="data-[state=active]:bg-white/20 text-white">
              <Settings className="h-4 w-4 mr-2" />
              Signum Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-white/20 text-white">
              <UserCog className="h-4 w-4 mr-2" />
              Roller
            </TabsTrigger>
            <TabsTrigger value="discussion" className="data-[state=active]:bg-white/20 text-white">
              <MessagesSquare className="h-4 w-4 mr-2" />
              Diskussion
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/20 text-white">
              <Shield className="h-4 w-4 mr-2" />
              Security Audit
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white">
              <Search className="h-4 w-4 mr-2" />
              Sök-analys
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-white/20 text-white">
              <Inbox className="h-4 w-4 mr-2" />
              Förslag
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6">
              <EntityEditor />
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <AdminDataManagement />
          </TabsContent>
          
          <TabsContent value="signum" className="mt-6">
            <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6">
              <SignumManagement />
            </div>
          </TabsContent>
          
          <TabsContent value="roles" className="mt-6">
            <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6">
              <AdminRoles />
            </div>
          </TabsContent>

          <TabsContent value="discussion" className="mt-6">
            <AdminDiscussion />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6">
              <SecurityAuditDashboard />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="bg-white/5 backdrop-blur-md border-white/10 rounded-lg p-6">
              <AdminSearchAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <UgcModerationQueue />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
