
import { useState } from 'react';
import { Plus, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrentlyStudying: boolean;
}

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

const EducationSection = ({ education, onChange }: EducationSectionProps) => {
  const [educationList, setEducationList] = useState<Education[]>(education);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentlyStudying: false
    };
    const updatedEducation = [...educationList, newEducation];
    setEducationList(updatedEducation);
    onChange(updatedEducation);
  };

  const removeEducation = (id: string) => {
    const updatedEducation = educationList.filter(edu => edu.id !== id);
    setEducationList(updatedEducation);
    onChange(updatedEducation);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    const updatedEducation = educationList.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducationList(updatedEducation);
    onChange(updatedEducation);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center">
          <GraduationCap className="w-4 h-4 mr-2" />
          Education
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addEducation}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </Button>
      </div>

      {educationList.map((edu, index) => (
        <Card key={edu.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Education {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`institution-${edu.id}`}>Institution *</Label>
                <Input
                  id={`institution-${edu.id}`}
                  placeholder="e.g., University of California"
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`degree-${edu.id}`}>Degree *</Label>
                <Input
                  id={`degree-${edu.id}`}
                  placeholder="e.g., Bachelor's, Master's, PhD"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`fieldOfStudy-${edu.id}`}>Field of Study</Label>
              <Input
                id={`fieldOfStudy-${edu.id}`}
                placeholder="e.g., Computer Science, Business Administration"
                value={edu.fieldOfStudy}
                onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${edu.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${edu.id}`}
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
                <Input
                  id={`endDate-${edu.id}`}
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  disabled={edu.isCurrentlyStudying}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`current-study-${edu.id}`}
                    checked={edu.isCurrentlyStudying}
                    onChange={(e) => {
                      updateEducation(edu.id, 'isCurrentlyStudying', e.target.checked);
                      if (e.target.checked) {
                        updateEducation(edu.id, 'endDate', '');
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`current-study-${edu.id}`} className="text-sm">Currently studying</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${edu.id}`}>Description</Label>
              <Textarea
                id={`description-${edu.id}`}
                placeholder="Describe relevant coursework, achievements, or activities..."
                value={edu.description}
                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {educationList.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No education added yet</p>
              <p className="text-sm">Click "Add Education" to start building your education history</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EducationSection;
