
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Adapted to match DB Question type + frontend needs
interface Question {
    id: string;
    content: string; // Mapped from DB 'content' to UI 'text'
    score_weight: number;
    caption?: string | null;
    rubrics?: Array<{ score: number; description: string }>;
}

interface SectionData {
    id: string;
    title: string;
    desc: string;
    maxScore: number;
    questions: Question[];
}

interface QuestionSectionProps {
    section: SectionData;
    sectionIndex: number;
    answers: Record<string, boolean | number>;
    onAnswerChange: (questionId: string, value: boolean | number) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({
    section,
    sectionIndex,
    answers,
    onAnswerChange,
}) => {
    return (
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8 animate-fade-in mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-border pb-4">
                <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide bg-accent px-2 py-1 rounded">
                        Dimension 0{sectionIndex + 1}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mt-2">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{section.desc}</p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                    <span className="text-xs text-muted-foreground block">배점 합계</span>
                    <span className="text-lg font-bold text-foreground">{section.maxScore}점</span>
                </div>
            </div>

            <div className="space-y-3">
                {section.questions.map((question) => {
                    const questionId = question.id;
                    const isChecked = answers[questionId] === true;

                    if (question.rubrics?.length) {
                        return (
                            <fieldset key={questionId} className="rounded-xl border border-border p-4">
                                <legend className="px-1 text-sm font-semibold leading-relaxed text-foreground md:text-base">{question.content}</legend>
                                <div className="mt-3 space-y-2">
                                    {question.rubrics.map((rubric) => {
                                        const selected = answers[questionId] === rubric.score
                                        return <label key={rubric.score} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition", selected ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:bg-slate-50")}><input type="radio" name={questionId} value={rubric.score} checked={selected} onChange={() => onAnswerChange(questionId, rubric.score)} className="mt-1" /><span className="text-sm leading-6"><strong className="mr-2 text-indigo-600">{rubric.score}점</strong>{rubric.description}</span></label>
                                    })}
                                </div>
                            </fieldset>
                        )
                    }

                    return (
                        <label
                            key={questionId}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200",
                                "border border-transparent hover:border-border checkbox-wrapper group",
                                isChecked ? "bg-accent/50" : "hover:bg-muted/50"
                            )}
                        >
                            <div className="relative flex-shrink-0 mt-1">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={isChecked}
                                    onChange={(e) => onAnswerChange(questionId, e.target.checked)}
                                />
                                <div
                                    className={cn(
                                        "w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all",
                                        "shadow-sm group-hover:border-primary/50",
                                        isChecked
                                            ? "bg-primary border-primary"
                                            : "bg-card border-slate-300"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "w-4 h-4 text-primary-foreground transition-opacity",
                                            isChecked ? "opacity-100" : "opacity-0"
                                        )}
                                        strokeWidth={3}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                {question.caption && (
                                    <p className="text-xs text-primary/70 font-semibold mb-1 tracking-tight">
                                        {question.caption}
                                    </p>
                                )}
                                <span className="text-foreground text-sm md:text-base font-medium leading-relaxed group-hover:text-foreground/90 transition">
                                    {question.content}
                                </span>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionSection;
