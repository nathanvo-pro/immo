"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Search,
  Settings,
  LayoutDashboard,
  Home as HomeIcon,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyEditorModal } from "@/components/property-editor-modal";

export default function AdminDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setAuthChecking(false);
        await fetchProperties();
      }
    }
    init();
  }, [router]);

  async function fetchProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching properties:", error);
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  }

  async function deleteProperty(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bien ?")) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert("Erreur lors de la suppression");
    } else {
      setProperties(properties.filter((p) => p.id !== id));
    }
  }

  function handleAdd() {
    setEditingProperty(null);
    setIsEditorOpen(true);
  }

  function handleEdit(property: Property) {
    setEditingProperty(property);
    setIsEditorOpen(true);
  }

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#C49D83] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#C49D83] font-serif font-bold italic">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#C49D83] text-[#f5efe6] p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-[#f5efe6] p-2 rounded-lg">
            <HomeIcon className="w-6 h-6 text-[#C49D83]" />
          </div>
          <span className="font-serif font-bold text-xl">Admin Panel</span>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 bg-[#f5efe6]/20 p-3 rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/" className="flex items-center gap-3 hover:bg-[#f5efe6]/10 p-3 rounded-xl transition-colors">
            <ExternalLink className="w-5 h-5" />
            Voir le site
          </Link>
          <button className="w-full flex items-center gap-3 hover:bg-[#f5efe6]/10 p-3 rounded-xl transition-colors text-left">
            <Settings className="w-5 h-5" />
            Paramètres
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 hover:bg-red-400 p-3 rounded-xl transition-colors mt-auto font-bold"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#C49D83]">Gestion du Portfolio</h1>
            <p className="text-[#BDA18A] font-medium">Gérez vos biens immobiliers et leurs détails</p>
          </div>
          <Button 
            onClick={handleAdd}
            className="bg-[#C49D83] hover:bg-[#BDA18A] text-[#f5efe6] h-12 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Ajouter un bien
          </Button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="bg-[#E8D5CC]/30 border-[#D5CABC]/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-serif font-bold text-[#C49D83]">{properties.length}</div>
              <div className="text-sm text-[#BDA18A] font-bold uppercase tracking-wider">Total Biens</div>
            </CardContent>
          </Card>
          <Card className="bg-[#E8D5CC]/30 border-[#D5CABC]/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-serif font-bold text-[#C49D83]">
                {properties.filter(p => p.is_available).length}
              </div>
              <div className="text-sm text-[#BDA18A] font-bold uppercase tracking-wider">Disponibles</div>
            </CardContent>
          </Card>
          <Card className="bg-[#E8D5CC]/30 border-[#D5CABC]/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-serif font-bold text-[#C49D83]">
                {properties.filter(p => !p.is_available).length}
              </div>
              <div className="text-sm text-[#BDA18A] font-bold uppercase tracking-wider">Vendus / Loués</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-[#D5CABC]/30 mb-6 gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BDA18A]" />
            <Input 
              placeholder="Rechercher par titre ou ville..." 
              className="pl-10 bg-white border-[#D5CABC]/50 focus:border-[#C49D83] rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table/List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#D5CABC]/30 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E8D5CC]/20 border-b border-[#D5CABC]/30">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#BDA18A]">Bien</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#BDA18A] hidden md:table-cell">Prix</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#BDA18A] hidden lg:table-cell">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-[#BDA18A] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-[#BDA18A] font-medium">Chargement des biens...</td>
                </tr>
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-[#BDA18A] font-medium">Aucun bien trouvé.</td>
                </tr>
              ) : (
                filteredProperties.map((p) => (
                  <tr key={p.id} className="border-b border-[#D5CABC]/20 hover:bg-[#f5efe6]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#E8D5CC] overflow-hidden">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-[#C49D83]">{p.title}</div>
                          <div className="text-xs text-[#BDA18A]">{p.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell font-serif font-bold text-[#C49D83]">
                      {new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.price)}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Badge className={p.is_available ? "bg-green-100 text-green-700 border-none" : "bg-red-100 text-red-700 border-none"}>
                        {p.is_available ? "Disponible" : "Vendu"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#C49D83] hover:bg-[#C49D83]/10"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => deleteProperty(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PropertyEditorModal 
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          property={editingProperty}
          onSuccess={fetchProperties}
        />
      </main>
    </div>
  );
}
