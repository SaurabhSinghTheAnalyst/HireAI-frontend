
import { useState } from 'react';
import { Plus, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  description: string;
  doesNotExpire: boolean;
}

interface CertificationSectionProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

const CertificationSection = ({ certifications, onChange }: CertificationSectionProps) => {
  const [certificationList, setCertificationList] = useState<Certification[]>(certifications);

  const addCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      description: '',
      doesNotExpire: false
    };
    const updatedCertifications = [...certificationList, newCertification];
    setCertificationList(updatedCertifications);
    onChange(updatedCertifications);
  };

  const removeCertification = (id: string) => {
    const updatedCertifications = certificationList.filter(cert => cert.id !== id);
    setCertificationList(updatedCertifications);
    onChange(updatedCertifications);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string | boolean) => {
    const updatedCertifications = certificationList.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    setCertificationList(updatedCertifications);
    onChange(updatedCertifications);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center">
          <Award className="w-4 h-4 mr-2" />
          Certifications
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addCertification}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </Button>
      </div>

      {certificationList.map((cert, index) => (
        <Card key={cert.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Certification {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCertification(cert.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`certName-${cert.id}`}>Certification Name *</Label>
                <Input
                  id={`certName-${cert.id}`}
                  placeholder="e.g., AWS Certified Developer"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`issuer-${cert.id}`}>Issuing Organization *</Label>
                <Input
                  id={`issuer-${cert.id}`}
                  placeholder="e.g., Amazon Web Services"
                  value={cert.issuingOrganization}
                  onChange={(e) => updateCertification(cert.id, 'issuingOrganization', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`issueDate-${cert.id}`}>Issue Date</Label>
                <Input
                  id={`issueDate-${cert.id}`}
                  type="month"
                  value={cert.issueDate}
                  onChange={(e) => updateCertification(cert.id, 'issueDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`expirationDate-${cert.id}`}>Expiration Date</Label>
                <Input
                  id={`expirationDate-${cert.id}`}
                  type="month"
                  value={cert.expirationDate}
                  onChange={(e) => updateCertification(cert.id, 'expirationDate', e.target.value)}
                  disabled={cert.doesNotExpire}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`no-expiry-${cert.id}`}
                    checked={cert.doesNotExpire}
                    onChange={(e) => {
                      updateCertification(cert.id, 'doesNotExpire', e.target.checked);
                      if (e.target.checked) {
                        updateCertification(cert.id, 'expirationDate', '');
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`no-expiry-${cert.id}`} className="text-sm">Does not expire</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`credentialId-${cert.id}`}>Credential ID</Label>
              <Input
                id={`credentialId-${cert.id}`}
                placeholder="e.g., ABC123XYZ"
                value={cert.credentialId}
                onChange={(e) => updateCertification(cert.id, 'credentialId', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`certDescription-${cert.id}`}>Description</Label>
              <Textarea
                id={`certDescription-${cert.id}`}
                placeholder="Describe what this certification covers..."
                value={cert.description}
                onChange={(e) => updateCertification(cert.id, 'description', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {certificationList.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No certifications added yet</p>
              <p className="text-sm">Click "Add Certification" to start building your credentials</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificationSection;
