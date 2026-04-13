window.DEMO_DATA = {
  fryers: [
    {
      id: 1,
      name: "Fryer 1",
      type: "Pressure Fryer",
      lastBoilOut: "2026-04-10",
      needsBoilOut: false,
      needsReason: "",
      needsNotes: "",
      history: [
        {
          timestamp: "2026-04-10T09:15:00",
          action: "Boil-out logged",
          initials: "AB"
        }
      ]
    },
    {
      id: 2,
      name: "Fryer 2",
      type: "Pressure Fryer",
      lastBoilOut: "2026-03-25",
      needsBoilOut: false,
      needsReason: "",
      needsNotes: "",
      history: [
        {
          timestamp: "2026-03-25T08:40:00",
          action: "Boil-out logged",
          initials: "CD"
        }
      ]
    },
    {
      id: 3,
      name: "Fryer 3",
      type: "Pressure Fryer",
      lastBoilOut: "2026-03-15",
      needsBoilOut: true,
      needsReason: "oil-quality",
      needsNotes: "Oil darkening faster than expected.",
      history: [
        {
          timestamp: "2026-04-11T14:05:00",
          action: "Boil-out needed flagged",
          initials: "EF",
          reason: "oil-quality",
          notes: "Oil darkening faster than expected."
        }
      ]
    },
    {
      id: 4,
      name: "Fryer 4",
      type: "Pressure Fryer",
      lastBoilOut: "2026-04-05",
      needsBoilOut: false,
      needsReason: "",
      needsNotes: "",
      history: []
    },
    {
      id: 5,
      name: "Fryer 5",
      type: "Pressure Fryer",
      lastBoilOut: "2026-03-20",
      needsBoilOut: false,
      needsReason: "",
      needsNotes: "",
      history: []
    },
    {
      id: 6,
      name: "Open Double Fryer",
      type: "Open Double Fryer",
      lastBoilOut: "2026-03-18",
      needsBoilOut: false,
      needsReason: "",
      needsNotes: "",
      history: []
    },
    {
      id: 7,
      name: "Open Single Fryer",
      type: "Open Single Fryer",
      lastBoilOut: "2026-03-10",
      needsBoilOut: false,
      needsReason: "",
      needsNotes: "",
      history: []
    }
  ],
  settings: {
    usersForTextAlerts: ["5551234567", "5559876543"],
    typeRules: {
      "Pressure Fryer": { neededDays: 22, overdueDays: 28 },
      "Open Single Fryer": { neededDays: 22, overdueDays: 28 },
      "Open Double Fryer": { neededDays: 22, overdueDays: 28 }
    }
  },
  updatedAt: "2026-04-13T10:30:00"
};