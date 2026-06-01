export default function Leaderboard() {
    const leaders = [
      { name: "Alex", score: 0 },
      { name: "Guest Fan", score: 0 }
    ];
  
    return (
      <section className="bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-3xl font-extrabold mb-4">Live Rankings</h2>
  
        <div className="space-y-3">
          {leaders.map((leader, index) => (
            <div
              key={leader.name}
              className="flex justify-between items-center border rounded-2xl px-4 py-3"
            >
              <span className="font-bold">
                #{index + 1} {leader.name}
              </span>
  
              <span className="text-blue-700 font-extrabold">
                {leader.score} pts
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }