'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChecklistSection {
    title: string;
    items: string[];
}

const mockDepartureChecklist: ChecklistSection[] = [
    {
        title: 'Kjøkken',
        items: [
            'Fjern mystisk smulehaug',
            'Slå av kaffetrakter før den tar hevn',
            'Rydd brødboksen for biologisk eksperiment',
            'Tøm kjøleskap for mat + håp',
        ],
    },
    {
        title: 'Stue',
        items: [
            'Grav frem fjernkontroll fra sofasprekken',
            'Fjern potetgull fra usannsynlige steder',
            'Reis opp teppet og stoltheten',
        ],
    },
    {
        title: 'Bad',
        items: [
            'Rens sluket – om du tør',
            'Speilet trenger ikke mer tannkremkunst',
            'Sjekk at vaskemaskina ikke visker om deg',
        ],
    },
    {
        title: 'Soverom',
        items: [
            'Rist puta – skrem ut mareritt',
            'Tell sokker (og håp det er partall)',
            'La senga se ut som du aldri var der',
        ],
    },
    {
        title: 'Gang',
        items: [
            'Rist teppet som om det fornærma deg',
            'Finn sko som hører sammen (lykke til)',
            'Rydd bort bevis på panisk pakking',
        ],
    },
    {
        title: 'Diverse',
        items: [
            'Skru av alt som blinker, durer eller piper',
            'Lukk vinduer – du bor ikke i et drivhus',
            'Si "ha det" til hytta som om den hører deg',
        ],
    },
    {
        title: 'Ute',
        items: [
            'Legg skuffa i dvale i boden',
            'Skru av vann før naturen gjør det for deg',
            'Lås boden og ikke se deg tilbake',
        ],
    },
];

export default function MockDepartureChecklist() {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >(
        Object.fromEntries(
            mockDepartureChecklist.map(section => [section.title, true]),
        ),
    );

    const handleCheckItem = (section: string, item: string) => {
        const key = `${section}-${item}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const resetChecklist = () => {
        setCheckedItems({});
    };

    // Calculate progress
    const totalItems = mockDepartureChecklist.reduce(
        (acc, section) => acc + section.items.length,
        0,
    );
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const progress =
        totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

    return (
        <Card>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <div>
                        <CardTitle className='flex items-center gap-2'>
                            <Eye className='h-5 w-5' />
                            Sjekkliste ved avreise (Demo)
                        </CardTitle>
                        <CardDescription>
                            Husk å fullføre alle punkter før du drar
                        </CardDescription>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={resetChecklist}
                    >
                        Nullstill
                    </Button>
                </div>

                <Alert className='mt-3'>
                    <Eye className='h-4 w-4' />
                    <AlertDescription>
                        Dette er kun en demo av en avreisesjekkliste. Den
                        inneholder ikke faktiske data og er ment for
                        demonstrasjonsformål. Du kan krysse av punkter for å se
                        hvordan det fungerer.
                    </AlertDescription>
                </Alert>

                <div className='mt-3'>
                    <div className='mb-1 flex items-center justify-between text-sm'>
                        <span>Progress</span>
                        <span className='font-medium'>
                            {progress}% ({checkedCount}/{totalItems})
                        </span>
                    </div>
                    <div className='bg-muted h-2 w-full rounded-full'>
                        <div
                            className='bg-primary h-2 rounded-full transition-all duration-300'
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='pt-0'>
                <div className='space-y-4'>
                    {mockDepartureChecklist.map(section => (
                        <Collapsible
                            key={section.title}
                            open={expandedSections[section.title]}
                            onOpenChange={() => toggleSection(section.title)}
                            className='rounded-md border opacity-75'
                        >
                            <CollapsibleTrigger asChild>
                                <div className='hover:bg-muted/50 flex cursor-pointer items-center justify-between p-3'>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='font-medium'>
                                            {section.title}
                                        </h3>
                                        <span className='text-muted-foreground text-xs'>
                                            (
                                            {
                                                section.items.filter(
                                                    item =>
                                                        checkedItems[
                                                            `${section.title}-${item}`
                                                        ],
                                                ).length
                                            }
                                            /{section.items.length})
                                        </span>
                                    </div>
                                    {expandedSections[section.title] ? (
                                        <ChevronUp className='text-muted-foreground h-4 w-4' />
                                    ) : (
                                        <ChevronDown className='text-muted-foreground h-4 w-4' />
                                    )}
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className='space-y-2 p-3 pt-0'>
                                    {section.items.map(item => (
                                        <div
                                            key={item}
                                            className='flex items-center space-x-2'
                                        >
                                            <Checkbox
                                                id={`${section.title}-${item}`}
                                                checked={
                                                    checkedItems[
                                                        `${section.title}-${item}`
                                                    ] || false
                                                }
                                                onCheckedChange={() =>
                                                    handleCheckItem(
                                                        section.title,
                                                        item,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`${section.title}-${item}`}
                                                className={`flex-1 text-sm ${
                                                    checkedItems[
                                                        `${section.title}-${item}`
                                                    ]
                                                        ? 'text-muted-foreground line-through'
                                                        : ''
                                                }`}
                                            >
                                                {item}
                                            </label>
                                            {checkedItems[
                                                `${section.title}-${item}`
                                            ] && (
                                                <Check className='h-4 w-4 text-green-500' />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
