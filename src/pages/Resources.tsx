import React, { useState, useEffect } from "react";
import {
  Phone,
  Globe,
  Shield,
  BookOpen,
  Heart,
  AlertTriangle,
  Trash2,
  Search,
  Mail,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

const db = getFirestore();
const ADMIN_EMAILS = [
  "safevoiceforwomen@gmail.com",
  "piyushydv011@gmail.com",
  "aditiraj0205@gmail.com",
];

interface NGO {
  id: string;
  name: string;
  description: string;
  contact?: string;
  email?: string;
  website?: string;
  registration_number?: string;
  approved?: boolean;
  category?: string;
}


const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-pink-200 rounded-xl overflow-hidden shadow-sm transition duration-300 hover:shadow-lg">
            <button
                className="flex justify-between items-center w-full p-4 bg-pink-100 text-left font-semibold text-pink-800 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg">{title}</span>
                {isOpen ? <ChevronUp className="h-5 w-5 text-pink-600" /> : <ChevronDown className="h-5 w-5 text-pink-600" />}
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
                } bg-white`}
            >
                {children}
            </div>
        </div>
    );
};


const NGOCard = ({ ngo, isAdmin, handleDeleteNGO }: { ngo: NGO, isAdmin: boolean, handleDeleteNGO: (id: string, name: string) => void }) => (
    <div className="relative bg-white rounded-xl p-6 shadow-md border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-pink-300">
        {isAdmin && (
            <button
                onClick={() => handleDeleteNGO(ngo.id, ngo.name)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 z-10"
                aria-label={`Delete ${ngo.name}`}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        )}
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800 leading-snug">{ngo.name}</h3>
            <span className="text-xs font-medium px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full">{ngo.category}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ngo.description}</p>
        
        <div className="space-y-2 text-sm text-gray-700">
            {ngo.contact && (
                <a href={`tel:${ngo.contact}`} className="flex items-center gap-2 hover:text-pink-600 transition">
                    <Phone className="h-4 w-4 text-pink-500 flex-shrink-0" />
                    {ngo.contact}
                </a>
            )}
            {ngo.website && (
                <a
                    href={ngo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600 hover:underline transition"
                >
                    <LinkIcon className="h-4 w-4 text-pink-500 flex-shrink-0" />
                    Visit Website
                </a>
            )}
        </div>
    </div>
);


export default function Resources() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [loadingNGOs, setLoadingNGOs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleNGOs, setVisibleNGOs] = useState(12);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
  
  
  const isAdmin: boolean = !!(user && ADMIN_EMAILS.includes(user.email || ""));

  useEffect(() => {
    const fetchNGOs = async () => {
      setLoadingNGOs(true);
      try {
        const ngosRef = collection(db, "ngos");
        const q = query(ngosRef, where("approved", "==", true));
        const querySnapshot = await getDocs(q);

        const ngosList: NGO[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            contact: data.contact,
            email: data.email,
            website: data.website,
            registration_number: data.registration_number,
            approved: data.approved,
            category: data.category || "General",
          };
        });

        ngosList.sort((a, b) => a.name.localeCompare(b.name));
        setNGOs(ngosList);
      } catch (error) {
        console.error("Error fetching NGOs:", error);
        toast.error("Could not load NGOs. Try refreshing.");
      } finally {
        setLoadingNGOs(false);
      }
    };

    fetchNGOs();
  }, []);

  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch =
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || ngo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteNGO = async (ngoId: string, ngoName: string) => {
    if (!window.confirm(`Delete "${ngoName}"? This cannot be undone.`)) return;

    const toastId = toast.loading(`Deleting ${ngoName}...`);
    try {
      const ngoRef = doc(db, "ngos", ngoId);
      await deleteDoc(ngoRef);
      setNGOs((prev) => prev.filter((ngo) => ngo.id !== ngoId));
      toast.success(`${ngoName} deleted.`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${ngoName}.`, { id: toastId });
    }
  };

  const handleShowMore = () => setVisibleNGOs((prev) => prev + 12);

  return (
    <div className="min-h-screen bg-gray-100 pb-24 pt-16">
      <div className="max-w-7xl mx-auto px-6 space-y-20">

        <header className="text-center pt-8 pb-4">
          <h1 className="text-6xl font-extrabold mb-4 animate-fade-in-down">
            <span className="bg-gradient-to-r from-pink-600 to-rose-800 bg-clip-text text-transparent">
              Verified Support Network
            </span>
          </h1>
          <p className="mt-4 text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed animate-fade-in-up-slow">
            Your centralized hub for verified NGOs, critical helplines, and actionable safety knowledge. **Empowerment starts here.**
          </p>
        </header>
        
        <section className="animate-fade-in-up delay-300">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Quick Access Helplines ⚡</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: Phone, title: "Women’s Helpline", number: "1091 / 181", color: "pink", desc: "24/7 National Distress Support" },
                { icon: AlertTriangle, title: "Police Emergency", number: "100 / 112", color: "red", desc: "Immediate Safety & Intervention" },
                { icon: Heart, title: "Child Helpline", number: "1098", color: "purple", desc: "Support for Children in Need" },
            ].map((item, idx) => (
                <a
                    href={`tel:${item.number.split(' / ')[0]}`}
                    key={idx}
                    className={`bg-white rounded-2xl shadow-xl p-6 text-center transform transition duration-500 hover:scale-[1.05] border-t-8 border-${item.color}-500 hover:shadow-2xl`}
                >
                    <item.icon className={`h-10 w-10 text-${item.color}-500 mx-auto mb-3`} />
                    <h3 className="font-semibold text-xl mb-1 text-gray-900">{item.title}</h3>
                    <p className="text-3xl font-extrabold text-${item.color}-600">{item.number}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                </a>
            ))}
            </div>
        </section>

       
        <section className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-200 animate-fade-in-up delay-400">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-4 border-pink-500 inline-block pb-2 pr-4">NGO Directory 📋</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute top-3 left-3 h-5 w-5 text-pink-400" />
                    <input
                        type="text"
                        placeholder="Search NGOs by name or mission..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 shadow-inner focus:ring-pink-500 focus:border-pink-500 transition duration-300"
                    />
                </div>
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none block w-full px-5 py-3 rounded-xl border-2 border-gray-300 shadow-inner focus:ring-pink-500 focus:border-pink-500 bg-white transition duration-300 pr-10"
                    >
                        <option value="all">All Categories</option>
                        <option value="Legal Aid">Legal Aid ⚖️</option>
                        <option value="Counseling">Counseling 🧘‍♀️</option>
                        <option value="Emergency">Emergency 🚨</option>
                        <option value="Shelter">Shelter 🏡</option>
                        <option value="General">General 🌍</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-600 pointer-events-none" />
                </div>
            </div>

            {loadingNGOs ? (
                <p className="text-center text-xl text-gray-500 py-8">Loading NGO partners...</p>
            ) : filteredNGOs.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNGOs.slice(0, visibleNGOs).map((ngo) => (
                            <NGOCard key={ngo.id} ngo={ngo} isAdmin={isAdmin} handleDeleteNGO={handleDeleteNGO} />
                        ))}
                    </div>
                    {visibleNGOs < filteredNGOs.length && (
                        <div className="text-center mt-10">
                            <button 
                                onClick={handleShowMore}
                                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                            >
                                Load More ({filteredNGOs.length - visibleNGOs} remaining)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center text-xl text-gray-500 py-8">No NGOs match your criteria. Try widening your search!</p>
            )}
        </section>


        <section className="grid md:grid-cols-2 gap-10 animate-fade-in-up delay-600">
            {/* HUB 1: Safety & Protection (Dark Pink) */}
            <div className="bg-pink-900 text-white rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6 border-b border-pink-700 pb-3">
                    <Shield className="h-8 w-8 text-pink-300 mr-3" />
                    <h2 className="text-2xl font-bold">Personal Safety & Protection Hub</h2>
                </div>
                <ul className="space-y-4 text-sm">
                    {[
                        { title: "Personal Safety Protocols", icon: Zap, tips: ["Trust your gut feeling—it's usually right.", "Establish a 'Code Word' with family/friends for emergencies.", "Be aware of your surroundings, especially at night."] },
                        { title: "Digital Security Checklist", icon: Globe, tips: ["Use a VPN on public Wi-Fi networks.", "Regularly audit app permissions on your phone.", "Never share location services with unknown apps."] },
                    ].map((hub, idx) => (
                        <Accordion key={idx} title={hub.title}>
                            <ul className="text-gray-700 space-y-2 list-disc list-inside pl-2">
                                {hub.tips.map((tip, i) => <li key={i} className="text-base">{tip}</li>)}
                            </ul>
                        </Accordion>
                    ))}
                    <p className="mt-6 text-pink-200 text-sm">
                        *Pro Tip: Always keep your phone charged and enable emergency sharing features on your device.
                    </p>
                </ul>
            </div>

            
            <div className="bg-pink-50 rounded-3xl p-8 shadow-2xl border border-pink-200">
                <div className="flex items-center mb-6 border-b border-pink-300 pb-3">
                    <BookOpen className="h-8 w-8 text-rose-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Legal & Emotional Healing Hub</h2>
                </div>
                <div className="space-y-4">
                    <Accordion title="Know Your Legal Rights ⚖️" defaultOpen={true}>
                        <ul className="text-gray-700 space-y-2 list-disc list-inside pl-2">
                            <li className="text-base">Protection against Domestic Violence Act, 2005.</li>
                            <li className="text-base">Right to Free Legal Aid.</li>
                            <li className="text-base">Confidentiality rights during police investigation.</li>
                        </ul>
                    </Accordion>
                    <Accordion title="Therapy & Recovery Paths 🧘‍♀️">
                        <ul className="text-gray-700 space-y-2 list-disc list-inside pl-2">
                            <li className="text-base">Finding trauma-informed therapists.</li>
                            <li className="text-base">Benefits of joining survivor support groups.</li>
                            <li className="text-base">Simple self-care and grounding techniques.</li>
                        </ul>
                    </Accordion>
                    <Accordion title="Community & Empowerment 💪">
                        <ul className="text-gray-700 space-y-2 list-disc list-inside pl-2">
                            <li className="text-base">Local workshops for skill development and financial independence.</li>
                            <li className="text-base">Connecting with advocacy networks.</li>
                        </ul>
                    </Accordion>
                </div>
            </div>
        </section>

        <section className="text-center pt-8 animate-fade-in-up delay-800">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect With Us</h2>
          <div className="bg-white rounded-xl shadow-lg p-6 inline-block transition hover:shadow-xl hover:scale-[1.01] border-b-4 border-pink-500">
            <p className="text-gray-600 mb-3">
              We are here to help and grow our network of support:
            </p>
            <p className="font-medium flex items-center justify-center">
              <Mail className="h-5 w-5 text-pink-600 mr-2" />
              Email:
              <a
                href="mailto:safevoiceforwomen@gmail.com"
                className="text-pink-600 ml-2 hover:underline font-semibold"
              >
                safevoiceforwomen@gmail.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
