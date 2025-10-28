import { RecentReply } from "@/types/campaign";

const RecentRepliesList = ({
  recentReplies,
}: {
  recentReplies: RecentReply[];
}) => {
  if (!recentReplies || recentReplies.length === 0) {
    return (
      <div className="p-6 text-muted-foreground">No recent replies found.</div>
    );
  }
  return (
    <>
      {recentReplies.map((reply, _index) => (
        <div
          key={reply.email}
          className="p-6 hover:bg-accent transition-colors rounded-2xl"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                {reply.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-foreground">{reply.name}</h3>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {reply.company}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reply.type === "positive"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {reply.type === "positive" ? "Interested" : "Not Interested"}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{reply.message}</p>
              <p className="text-sm text-muted-foreground mt-2">{reply.time}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RecentRepliesList;
