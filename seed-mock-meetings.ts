
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MOCK_MEETINGS = [
  {
    id: "719ce3f0-4a8a-4b7b-8c8d-3f0e1a2b3c4d",
    title: "Architecture Review: Neural Gateway",
    department: "engineering",
    agenda: "Decide cloud provider migration strategy and confirm data store choice",
    summary: "Decision on cloud provider migration strategy. Team agreed to migrate core services to GCP and use Firestore for real-time sync.",
    transcript_text: "We need to decide the cloud provider migration strategy and confirm the data store choice. The team agreed to migrate core services to GCP and use Firestore for real-time sync.",
    contradictions: [],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // Yesterday
  },
  {
    id: "820de4f1-5b9b-5c8c-9d9e-4f1f2b3c4d5e",
    title: "Sprint Retro: RAG Optimization",
    department: "engineering",
    agenda: "Review sprint outcomes and align on Q2 deliverables",
    summary: "Sprint planning for Q2 deliverables. A candidate suggested sticking to AWS, which contradicts the migration strategy decided yesterday.",
    transcript_text: "We reviewed sprint outcomes and aligned on Q2 deliverables. There was a suggestion to stick with AWS despite the migration strategy decided yesterday.",
    contradictions: [
      "Speaker 'John Doe' suggested continuing AWS expansion, which contradicts the decision from 'Architecture Sync' where GCP was selected as the sole provider."
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: "931ef5f2-6c0c-6d9d-ae0f-5f2f3c4d5e6f",
    title: "Product Alignment Hub",
    department: "marketing",
    agenda: "Align on feature prioritization and decide Q2 launch priorities",
    summary: "Discussion on feature prioritization. The meeting lacked a clear agenda and ended without any solid decisions or outcomes.",
    transcript_text: "We discussed feature prioritization but did not decide on Q2 launch priorities. The agenda was not followed and no solid outcomes were reached.",
    contradictions: [
        "This meeting ended without any fruitful outcomes, contradicting the 'Product Efficiency' goal set in the Q1 OKR review."
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
  },
  {
    id: "a42f06f3-7d1d-7e0e-bf1f-6f3f4c4d5e7f",
    title: "Quarterly Budget Review",
    department: "finance",
    agenda: "Finalize Q3 budgets and confirm cost-cutting targets",
    summary: "Finalizing department budgets for Q3. Finance lead approved a 15% increase for the R&D team despite previous calls for cost cutting.",
    transcript_text: "We finalized department budgets for Q3 and discussed cost-cutting targets. The finance lead approved a 15% increase for R&D despite earlier cost-cutting goals.",
    contradictions: [
        "The 15% budget increase for R&D directly contradicts the 'Efficiency First' mandate issued during the Town Hall last month."
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    id: "b53f17f4-8e2e-8f1f-cf2f-7f4f5c5d6e8f",
    title: "Security Audit: Post-Mortem",
    department: "engineering",
    agenda: "Review the incident, confirm credential rotation, and approve remediation plan",
    summary: "Reviewing the database leak incident. Security lead claims all credentials have been rotated, but engineering reports show no changes to the main API keys.",
    transcript_text: "We reviewed the incident, discussed credential rotation, and tried to approve the remediation plan. Evidence showed no change to the main API keys.",
    contradictions: [
        "Statement regarding 'complete credential rotation' is inconsistent with the 'Access Logs' which show no updates to the primary AWS IAM roles in the last 24 hours."
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() // 3 days ago
  },
  {
    id: "c64f28f5-9f3f-9f20-df3f-8f5f6c6d7e9f",
    title: "Market Expansion Strategy",
    department: "marketing",
    agenda: "Define Europe launch plan and confirm partner-only channel for Germany",
    summary: "Planning the European launch. Head of Sales proposed a direct-to-consumer model for Germany, ignoring the partner-only agreement signed with local distributors last week.",
    transcript_text: "We defined the Europe launch plan and confirmed partner-only channels for Germany. A direct-to-consumer proposal conflicted with the partner-only agreement.",
    contradictions: [
        "The D2C strategy for Germany violates the 'Channel Exclusivity' contract signed with Berlin-based partners on March 7th."
    ],
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() // 4 days ago
  }
];

async function seed() {
  console.log("Seeding mock meetings with contradictions and valid UUIDs...");
  for (const meeting of MOCK_MEETINGS) {
    const { error } = await supabase.from('meetings').upsert(meeting, { onConflict: 'id' });
    if (error) console.error(`Error seeding ${meeting.id}:`, error.message);
    else console.log(`Seeded ${meeting.id}`);
  }
}

seed();
