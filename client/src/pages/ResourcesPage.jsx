import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import data from "../constants/dsa.json";

export function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter companies based on search
  const filteredCompanies = Object.entries(data).filter(
    ([company]) => company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DSA Question Bank</h1>
        <p className="text-muted-foreground">
          Search questions by company name (e.g., Amazon, Google)
        </p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No companies found matching "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCompanies.map(([company, questions]) => (
            <div key={company}>
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {company}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {questions.map((question) => (
                  <QuestionCard key={question.question_no} question={question} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question }) {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            #{question.question_no}. {question.question_name}
          </CardTitle>
          <Badge className={difficultyColors[question.difficulty]}>
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          {question.subtopics.map((topic) => (
            <Badge variant="outline" key={topic}>
              {topic}
            </Badge>
          ))}
        </div>
        <a
          href={question.question_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          View on LeetCode →
        </a>
      </CardContent>
    </Card>
  );
}

export default ResourcesPage;