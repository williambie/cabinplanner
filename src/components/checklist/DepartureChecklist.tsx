'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
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

interface ChecklistSection {
    title: string;
    items: string[];
}

const departureChecklist: ChecklistSection[] = [
    {
        title: 'Kjøkken',
        items: [
            'Rydde og vask opp',
            'Vask stekovn (hvis brukt)',
            'Vask over skapfronter (fingermerker)',
            'Tøm og vask brødboks',
            'Vask kaffetrakter',
            'Dra ut støpsel på kaffetrakter',
            'Tøm kjøleskap (ferskvarer)',
            'Sett døra på oppvaskmaskin på gløtt',
            'Tøm søppel',
            'Vask gulv',
        ],
    },
    {
        title: 'Stue',
        items: [
            'Støvsug gulv, sofa og spisestoler',
            'Vaske spisebord',
            'Tørk støv (vurderes)',
            'Vask gulvet (vurderes)',
        ],
    },
    {
        title: 'Bad',
        items: [
            'Vask dusj, do, servant, speil, fronter',
            'Vask gulv (ekstra fokus på dusjgulv)',
            'Sett dør på vaskemaskin på gløtt',
            'Dra ut støpsel på vaskemaskin',
        ],
    },
    {
        title: 'Soverom',
        items: [
            'Støvsuge gulv, bord og vinduskarm',
            'Støvsuge andre sine madrasser',
            'Vask gulv (vurderes avhengig av bruk)',
        ],
    },
    {
        title: 'Gangen',
        items: [
            'Riste rya',
            'Støvsuge gulv',
            'Vaske gulv',
            'Flytte evt. tøy fra gangen til skap',
        ],
    },
    {
        title: 'Diverse',
        items: [
            'Sjekk at kameraet er på (grønt lys)',
            'Lås begge verandadørene',
            'Lukk alle vinduer',
            'Dra ned alle blendingsgardiner',
            'Skru av alt lys',
            'La alle innerdører stå på gløtt (VIKTIG!)',
            'Lås hytta',
        ],
    },
    {
        title: 'Utendørs',
        items: [
            'Sett inn skuffa i boden',
            'Skru av vannet i boden',
            'Lås boden',
        ],
    },
];

export default function DepartureChecklist() {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >(
        Object.fromEntries(
            departureChecklist.map(section => [section.title, true]),
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
    const totalItems = departureChecklist.reduce(
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
                        <CardTitle>Sjekkliste ved avreise</CardTitle>
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
                <div className='mt-2'>
                    <div className='mb-1 flex items-center justify-between text-sm'>
                        <span>Fremgang</span>
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
                    {departureChecklist.map(section => (
                        <Collapsible
                            key={section.title}
                            open={expandedSections[section.title]}
                            onOpenChange={() => toggleSection(section.title)}
                            className='rounded-md border'
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
