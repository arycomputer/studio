
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addClient } from '@/app/actions';
import { useState, useMemo } from 'react';
import { Loader2, Trash2, X, File as FileIcon } from 'lucide-react';
import type { Client } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { states } from '@/lib/brazil-data';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  phone: z.string().optional().refine(
    (value) => {
      if (!value) return true; // Optional field
      const numericValue = value.replace(/\D/g, '');
      return numericValue.length === 10 || numericValue.length === 11;
    },
    {
      message: 'O número de celular deve ter 10 ou 11 dígitos (com DDD).',
    }
  ),
  address: z.object({
    cep: z.string().optional().refine(
        (value) => {
            if(!value) return true;
            return /^\d{8}$/.test(value.replace(/\D/g, ''));
        },
        'CEP inválido. Deve conter 8 dígitos.'
    ),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    referencia: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
  }).optional(),
  rate: z.coerce
    .number({ invalid_type_error: 'A taxa deve ser um número.' })
    .positive('A taxa de juros deve ser um número positivo.')
    .optional(),
  documents: z.any().optional(),
});

type AddClientFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClientAdded: (client: Client) => void;
};

const isImageFile = (file: File) => file.type.startsWith('image/');

export function AddClientForm({
  isOpen,
  onOpenChange,
  onClientAdded,
}: AddClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        referencia: '',
        cidade: '',
        estado: '',
      },
      rate: 0,
    },
  });
  
  const selectedState = form.watch('address.estado');
  const cities = useMemo(() => {
    const stateData = states.find(s => s.sigla === selectedState);
    return stateData ? stateData.cidades : [];
  }, [selectedState]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files!)]);
    }
     // Reset the input value to allow selecting the same file again
    if(event.target){
      event.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const newClient = await addClient({...values, documents: files});
      onClientAdded(newClient);
      toast({
        title: 'Sucesso!',
        description: 'Novo cliente adicionado.',
      });
      form.reset();
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível adicionar o cliente. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            form.reset();
            setFiles([]);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para adicionar um novo cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="(99) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 rounded-md border p-4">
                 <h3 className="text-sm font-medium">Endereço</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.cep"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                 <FormField
                  control={form.control}
                  name="address.logradouro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua Principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                      control={form.control}
                      name="address.numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="address.bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <FormField
                  control={form.control}
                  name="address.referencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referência</FormLabel>
                      <FormControl>
                        <Input placeholder="Próximo ao parque" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-5 gap-4">
                     <FormField
                        control={form.control}
                        name="address.estado"
                        render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Estado</FormLabel>
                             <Select onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue('address.cidade', '');
                             }} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="UF" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {states.map(state => (
                                        <SelectItem key={state.sigla} value={state.sigla}>{state.sigla}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address.cidade"
                        render={({ field }) => (
                        <FormItem className="col-span-3">
                            <FormLabel>Cidade</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a cidade" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                     {cities.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa Mensal de Juros (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1.0" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documentos</FormLabel>
                   <FormControl>
                     <Button type="button" variant="outline" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer w-full">
                           Adicionar Arquivos...
                           <Input 
                              id="file-upload"
                              type="file" 
                              multiple
                              onChange={handleFileChange}
                              className="sr-only"
                           />
                        </label>
                     </Button>
                  </FormControl>
                  <FormMessage />
                  
                   {files && files.length > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {files.map((file, index) => (
                            isImageFile(file) ? (
                              <Card key={index} className="relative group">
                                <CardContent className="p-0">
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    width={100}
                                    height={100}
                                    className="w-full h-24 object-cover rounded-md"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </CardContent>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </Card>
                            ) : null
                          ))}
                        </div>
                        <ul className='text-sm text-muted-foreground space-y-1 pt-2'>
                          {files.map((file, index) => (
                            !isImageFile(file) ? (
                              <li key={index} className='flex items-center justify-between bg-muted p-1 rounded-md'>
                                  <div className="flex items-center gap-2 truncate">
                                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" className='h-6 w-6 flex-shrink-0' onClick={() => removeFile(index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </li>
                            ) : null
                          ))}
                        </ul>
                      </div>
                    )}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Adicionar Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    