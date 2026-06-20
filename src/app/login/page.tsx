"use client";

import { motion } from "framer-motion";
import { Brain, ArrowRight, User, Code, Megaphone, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { LiquidMetalBackground } from "@/components/liquid-metal-background";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (role: string) => {
        // Simulate login by setting a role in localStorage
        localStorage.setItem("lyka_role", role);
        router.push("/dashboard");
    };

    return (
        <main className="min-h-screen relative flex items-center justify-center overflow-hidden selection:bg-primary/30">
            <LiquidMetalBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-10 glass rounded-[3rem] border-white/10 shadow-2xl backdrop-blur-2xl bg-black/40"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.7, type: "spring" }}
                        className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                    >
                        <Brain className="text-primary w-8 h-8" />
                    </motion.div>

                    <Badge variant="outline" className="mb-4 bg-primary/5 border-primary/10 text-primary text-[10px] uppercase tracking-widest font-bold">
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        Neural Authentication
                    </Badge>

                    <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Home</h1>
                    <p className="text-slate-500 text-sm">Select your cognitive workspace to continue</p>
                </div>

                <div className="space-y-4">
                    <RoleButton
                        icon={<Code className="w-5 h-5" />}
                        title="Engineering"
                        desc="Development & Neural Arch"
                        onClick={() => handleLogin("engineering")}
                    />
                    <RoleButton
                        icon={<Megaphone className="w-5 h-5" />}
                        title="Marketing"
                        desc="Growth & Cognitive Strategy"
                        onClick={() => handleLogin("marketing")}
                    />
                    <RoleButton
                        icon={<User className="w-5 h-5" />}
                        title="Executive"
                        desc="Governance & Intuition"
                        onClick={() => handleLogin("executive")}
                    />
                </div>

                <div className="mt-10 pt-10 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
                        Powered by Artificial Intuition
                    </p>
                </div>
            </motion.div>
        </main>
    );
}

function RoleButton({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/40 hover:translate-y-[-2px] transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all text-primary">
                    {icon}
                </div>
                <div className="text-left">
                    <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors uppercase text-xs tracking-widest">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{desc}</p>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-all" />
            </div>
        </button>
    );
}
