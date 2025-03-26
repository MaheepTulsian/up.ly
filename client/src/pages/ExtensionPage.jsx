import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chrome, Rocket, User, Zap } from 'lucide-react';

function ExtensionPage() {
  const features = [
    {
      icon: <User className="w-5 h-5" />,
      title: "Smart Profile Context",
      description: "Automatically captures your professional profile including skills, experience, and education to tailor applications."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "One-Click Autofill",
      description: "Fills job applications with your information in seconds, saving hours of manual entry."
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Intelligent Matching",
      description: "Highlights the best-fit jobs based on your profile and application history."
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          <Chrome className="w-4 h-4 mr-2" />
          Browser Extension
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Supercharge Your Job Search
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our extension transforms your job application process with AI-powered automation.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-primary/10 mr-3">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ready to Save 10+ Hours Per Week?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of professionals who automated their job search.
          </p>
          <Button size="lg" className="gap-2">
            <Chrome className="w-5 h-5" />
            Chrome - It's Free
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExtensionPage;