
import React from 'react';
import type { TemplateId } from '../types';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

const templates: { id: TemplateId; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'A timeless, professional look.' },
  { id: 'modern', name: 'Modern', description: 'Clean lines and a splash of color.' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, elegant, and to the point.' },
];

const TemplatePreview: React.FC<{ templateId: TemplateId }> = ({ templateId }) => {
    if (templateId === 'classic') {
        return (
            <div className="w-full h-full bg-white border border-gray-200 p-2 space-y-2">
                <div className="h-2 bg-gray-600 rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-3/4 rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-1/2 rounded-sm"></div>
                <hr className="border-gray-300 my-2" />
                <div className="h-1 bg-gray-400 w-full rounded-sm"></div>
                <div className="h-1 bg-gray-300 w-full rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-full rounded-sm"></div>
            </div>
        );
    }
    if (templateId === 'modern') {
        return (
            <div className="w-full h-full bg-white border border-gray-200 p-2 space-y-2">
                <div className="h-2 bg-indigo-500 rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-2/3 rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-1/3 rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-full rounded-sm mt-4"></div>
                <div className="h-1 bg-gray-300 w-full rounded-sm"></div>
                <div className="h-1 bg-gray-400 w-full rounded-sm"></div>
            </div>
        );
    }
    // minimalist
    return (
        <div className="w-full h-full bg-white border border-gray-200 p-2 space-y-2 font-mono text-xs">
            <div className="h-1 bg-gray-700 w-1/4 rounded-sm"></div>
            <div className="h-1 bg-gray-500 w-1/2 rounded-sm mt-4"></div>
            <div className="h-1 bg-gray-500 w-full rounded-sm mt-4"></div>
            <div className="h-1 bg-gray-500 w-full rounded-sm"></div>
            <div className="h-1 bg-gray-500 w-full rounded-sm"></div>
        </div>
    );
};


const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-800">Choose a Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {templates.map((template) => (
                <div
                    key={template.id}
                    onClick={() => onSelectTemplate(template.id)}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                        selectedTemplate === template.id
                        ? 'border-indigo-500 shadow-lg'
                        : 'border-gray-200 hover:border-indigo-400'
                    }`}
                >
                    <div className="h-24 bg-gray-50 rounded-md mb-3">
                        <TemplatePreview templateId={template.id} />
                    </div>
                    <h4 className="font-semibold text-gray-700">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.description}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default TemplateSelector;
