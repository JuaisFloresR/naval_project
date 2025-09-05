'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { User } from '@/types';
import ExcelJS from 'exceljs';

interface ExcelImportProps {
  onImport: (users: User[]) => void;
}

export default function ExcelImport({ onImport }: ExcelImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPreviewData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheet found in the Excel file');
      }

      const jsonData: any[] = [];
      const headers: string[] = [];
      
      // Get headers from first row
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.text || '';
      });
      
      // Process data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = cell.text || '';
          }
        });
        
        // Only add row if it has data
        if (Object.values(rowData).some(value => value !== '')) {
          jsonData.push(rowData);
        }
      });

      if (jsonData.length === 0) {
        throw new Error('The Excel file appears to be empty');
      }

      // Show preview of first 5 rows
      setPreviewData(jsonData.slice(0, 5));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAndImport = () => {
    if (previewData.length === 0) return;

    try {
      // Read the full file again for complete import
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);
          
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            throw new Error('No worksheet found in the Excel file');
          }

          const jsonData: any[] = [];
          const headers: string[] = [];
          
          // Get headers from first row
          const headerRow = worksheet.getRow(1);
          headerRow.eachCell((cell, colNumber) => {
            headers[colNumber - 1] = cell.text || '';
          });
          
          // Process data rows
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            
            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber - 1];
              if (header) {
                rowData[header] = cell.text || '';
              }
            });
            
            // Only add row if it has data
            if (Object.values(rowData).some(value => value !== '')) {
              jsonData.push(rowData);
            }
          });

          const users: User[] = jsonData.map((row: any, index: number) => {
            // Map Excel columns to User interface
            // Adjust these mappings based on your Excel column names
            const normalizeStatus = (status: string): 'active' | 'inactive' => {
              const normalized = status?.toLowerCase().trim();
              return normalized === 'inactive' ? 'inactive' : 'active';
            };

            const normalizeRole = (role: string): string => {
              const normalized = role?.toLowerCase().trim();
              const validRoles = ['admin', 'manager', 'employee', 'contractor'];
              return validRoles.includes(normalized) ? normalized : 'employee';
            };

            const normalizeDepartment = (dept: string): string => {
              const normalized = dept?.toLowerCase().trim();
              const validDepts = ['engineering', 'marketing', 'sales', 'hr', 'finance'];
              return validDepts.includes(normalized) ? normalized : 'general';
            };

            return {
              id: Date.now().toString() + index,
              name: row.Name || row.name || row['Full Name'] || '',
              email: row.Email || row.email || row['Email Address'] || '',
              role: normalizeRole(row.Role || row.role || 'employee'),
              department: normalizeDepartment(row.Department || row.department || 'general'),
              status: normalizeStatus(row.Status || row.status || 'active'),
              joinDate: row['Join Date'] || row.joinDate || row['Start Date'] || new Date().toISOString().split('T')[0],
            };
          });

          onImport(users);
          setPreviewData([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to process Excel data');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process Excel data');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import from Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Select Excel File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="flex-1"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Processing Excel file...</p>
          </div>
        )}

        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Preview (First 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200">
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-medium text-blue-900">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b border-blue-100">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-blue-800">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={processAndImport} className="bg-green-600 hover:bg-green-700">
                Import Data ({previewData.length}+ rows)
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setPreviewData([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Column Mapping:</strong></p>
              <p>• Name/Full Name → Name</p>
              <p>• Email/Email Address → Email</p>
              <p>• Role → Role (Admin, Manager, Employee, Contractor)</p>
              <p>• Department → Department (Engineering, Marketing, Sales, HR, Finance)</p>
              <p>• Status → Status (active, inactive)</p>
              <p>• Join Date/Start Date → Join Date</p>
              <p className="text-amber-600 font-medium">Note: Invalid values will default to safe options</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}