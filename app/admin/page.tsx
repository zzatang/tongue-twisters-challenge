"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

type DifficultyLevel = "Easy" | "Intermediate" | "Advanced";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    text: "",
    difficulty: "Easy" as DifficultyLevel,
    category: "",
    description: "",
    exampleWords: "",
    phoneticFocus: ""
  });

  // Redirect if not logged in
  if (isLoaded && !user) {
    router.push("/");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Only send the fields that exist in the database
      const response = await fetch('/api/admin/tongue-twisters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.text,
          difficulty: formData.difficulty,
          category: formData.category
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tongue twister');
      }

      // Reset form
      setFormData({
        text: "",
        difficulty: "Easy",
        category: "",
        description: "",
        exampleWords: "",
        phoneticFocus: ""
      });

      toast({
        title: "Success!",
        description: "Tongue twister added successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding tongue twister:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add tongue twister. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-bounce mb-4">
            <Sparkles className="h-12 w-12 text-[hsl(var(--fun-purple))] mx-auto" />
          </div>
          <p className="text-xl font-bubblegum text-[hsl(var(--fun-purple))]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fun-pattern">
      <header className="border-b border-[hsl(var(--fun-purple))]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bubblegum text-[hsl(var(--fun-purple))] flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-[hsl(var(--fun-yellow))] animate-float" />
            Admin Dashboard
          </h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bubblegum text-[hsl(var(--fun-purple))]">
              Add New Tongue Twister
            </CardTitle>
            <CardDescription>
              Fill out the form below to add a new tongue twister to the database.
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <strong>Note:</strong> Only the text, difficulty, and category fields are stored in the database.
                Other fields are for your reference only.
              </div>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Tongue Twister Text</Label>
                <Textarea
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  placeholder="Enter the tongue twister text"
                  required
                  className="min-h-24"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., S sounds"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description (Reference Only)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter a description of this tongue twister (not stored in database)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exampleWords">
                  Example Words (Reference Only)
                </Label>
                <Input
                  id="exampleWords"
                  name="exampleWords"
                  value={formData.exampleWords}
                  onChange={handleChange}
                  placeholder="e.g., seashells, seashore, sells (not stored in database)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneticFocus">
                  Phonetic Focus (Reference Only)
                </Label>
                <Input
                  id="phoneticFocus"
                  name="phoneticFocus"
                  value={formData.phoneticFocus}
                  onChange={handleChange}
                  placeholder="e.g., s, sh (not stored in database)"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[hsl(var(--fun-purple))] to-[hsl(var(--fun-pink))] hover:opacity-90 transition-opacity"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Tongue Twister"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
