export default function GroupModeSelector({ darkMode, onCasual, onExpert }) {
    return (
      <section
        className={`rounded-3xl shadow-2xl p-10 text-center ${
          darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
      >
        <h2 className="text-4xl font-extrabold mb-4">
          Choose Group Stage Mode
        </h2>
  
        <p className={darkMode ? "text-slate-300" : "text-gray-600"}>
          Casual mode is fast. Expert mode lets you predict every individual
          group-stage match and updates the standings live.
        </p>
  
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={onCasual}
            className="rounded-3xl bg-blue-600 text-white p-8 font-extrabold text-3xl hover:bg-blue-700 transition"
          >
            Casual Mode
            <div className="mt-3 text-base font-medium opacity-90">
              Quick ranking + autofill tools
            </div>
          </button>
  
          <button
            onClick={onExpert}
            className="rounded-3xl bg-purple-600 text-white p-8 font-extrabold text-3xl hover:bg-purple-700 transition"
          >
            Expert Mode
            <div className="mt-3 text-base font-medium opacity-90">
              Predict every matchup
            </div>
          </button>
        </div>
      </section>
    );
  }