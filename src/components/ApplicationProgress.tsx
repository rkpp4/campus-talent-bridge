import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, FileText, Send, XCircle } from "lucide-react";

interface ApplicationProgressProps {
  status: string;
  showSteps?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; progress: number; icon: React.ElementType }> = {
  applied: {
    label: "Applied",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    progress: 25,
    icon: Send,
  },
  reviewing: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    progress: 50,
    icon: FileText,
  },
  interview: {
    label: "Interview",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    progress: 75,
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-700 border-green-200",
    progress: 100,
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
    progress: 100,
    icon: XCircle,
  },
};

const steps = ["applied", "reviewing", "interview", "accepted"];

export function ApplicationProgress({ status, showSteps = false }: ApplicationProgressProps) {
  const config = statusConfig[status] || statusConfig.applied;
  const Icon = config.icon;

  if (!showSteps) {
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  }

  const currentIndex = steps.indexOf(status);
  const isRejected = status === "rejected";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} gap-1`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
      </div>

      {!isRejected && (
        <>
          <Progress value={config.progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const stepConfig = statusConfig[step];
              const StepIcon = stepConfig.icon;
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={step}
                  className={`flex flex-col items-center gap-1 ${
                    isCompleted ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-primary/20"
                        : "bg-muted"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {stepConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
