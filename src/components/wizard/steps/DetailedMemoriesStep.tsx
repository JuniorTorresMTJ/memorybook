import { motion } from 'framer-motion';
import { Sparkles, Rocket, Gem, Leaf, MapPin, Users, Heart, Smile, Briefcase, Music, GraduationCap, Baby, Trophy, Home, CalendarHeart, HandHeart, BookHeart } from 'lucide-react';
import type { ChildhoodData, TeenageData, AdultLifeData, LaterLifeData } from '../types';
import { FormInput, FormTextArea } from '../FormTextArea';
import { useLanguage } from '../../../contexts/LanguageContext';

interface DetailedMemoriesStepProps {
    childhood: ChildhoodData;
    teenage: TeenageData;
    adultLife: AdultLifeData;
    laterLife: LaterLifeData;
    onChildhoodChange: (data: Partial<ChildhoodData>) => void;
    onTeenageChange: (data: Partial<TeenageData>) => void;
    onAdultLifeChange: (data: Partial<AdultLifeData>) => void;
    onLaterLifeChange: (data: Partial<LaterLifeData>) => void;
}

export const DetailedMemoriesStep = ({
    childhood,
    teenage,
    adultLife,
    laterLife,
    onChildhoodChange,
    onTeenageChange,
    onAdultLifeChange,
    onLaterLifeChange,
}: DetailedMemoriesStepProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
        >
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-teal to-teal-400 flex items-center justify-center">
                        <BookHeart className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main">
                        {wz?.detailedMemoriesTitle || 'Conte a história com detalhes'}
                    </h2>
                </div>
                <p className="text-text-muted">
                    {wz?.detailedMemoriesIntro || 'Quanto mais detalhes compartilhar, mais rico e pessoal será o livro. Preencha o que souber — cada campo é opcional.'}
                </p>
            </div>

            {/* ====== CHILDHOOD ====== */}
            <section className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-5">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-text-main">{wz?.childhood || 'Infância'}</h3>
                    <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'opcional'}</span>
                </div>

                <FormInput
                    id="d-birthPlace"
                    label={wz?.whereBorn || 'Onde nasceu?'}
                    value={childhood.birthPlace}
                    onChange={(birthPlace) => onChildhoodChange({ birthPlace })}
                    placeholder={wz?.birthPlacePlaceholder || 'Ex: Interior de Minas Gerais, numa casa amarela'}
                    icon={<MapPin className="w-5 h-5" />}
                />
                <FormInput
                    id="d-parents"
                    label={wz?.whoParents || 'Quem eram os pais?'}
                    value={childhood.parents}
                    onChange={(parents) => onChildhoodChange({ parents })}
                    placeholder={wz?.parentsPlaceholder || 'Ex: Dona Rosa e Seu Antônio'}
                    icon={<Users className="w-5 h-5" />}
                />
                <FormInput
                    id="d-siblings"
                    label={wz?.siblings || 'Tinha irmãos?'}
                    value={childhood.siblings}
                    onChange={(siblings) => onChildhoodChange({ siblings })}
                    placeholder={wz?.siblingsPlaceholder || 'Ex: Três irmãos mais novos'}
                    icon={<Users className="w-5 h-5" />}
                />
                <FormTextArea
                    id="d-happyMemory"
                    label={wz?.happyMemory || 'Uma memória feliz da infância'}
                    value={childhood.happyMemory}
                    onChange={(happyMemory) => onChildhoodChange({ happyMemory })}
                    placeholder={wz?.happyMemoryPlaceholder || 'Compartilhe uma lembrança especial...'}
                    rows={3}
                    icon={<Heart className="w-5 h-5" />}
                    enhanceContext="childhood_happyMemory"
                />
                <FormTextArea
                    id="d-enjoyed"
                    label={wz?.whatEnjoy || 'O que gostava de fazer?'}
                    value={childhood.enjoyedActivities}
                    onChange={(enjoyedActivities) => onChildhoodChange({ enjoyedActivities })}
                    placeholder={wz?.enjoyedPlaceholder || 'Ex: Brincar no quintal, subir em árvores, pescar...'}
                    rows={2}
                    icon={<Smile className="w-5 h-5" />}
                    enhanceContext="childhood_activities"
                />
            </section>

            {/* ====== TEENAGE ====== */}
            <section className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-5">
                <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-text-main">{wz?.teenage || 'Adolescência'}</h3>
                    <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'opcional'}</span>
                </div>

                <FormInput
                    id="d-teenLiving"
                    label={wz?.whereYoung || 'Onde morava na adolescência?'}
                    value={teenage.livingPlace}
                    onChange={(livingPlace) => onTeenageChange({ livingPlace })}
                    placeholder={wz?.youngLivingPlaceholder || 'Ex: Mudou para a cidade para estudar'}
                    icon={<Home className="w-5 h-5" />}
                />
                <FormTextArea
                    id="d-school"
                    label={wz?.schoolExperience || 'Experiências na escola'}
                    value={teenage.schoolExperiences}
                    onChange={(schoolExperiences) => onTeenageChange({ schoolExperiences })}
                    placeholder={wz?.schoolPlaceholder || 'Ex: Era dedicado, primeiro da família a estudar...'}
                    rows={3}
                    icon={<GraduationCap className="w-5 h-5" />}
                    enhanceContext="teenage_school"
                />
                <FormTextArea
                    id="d-friends"
                    label={wz?.friendsInterests || 'Amigos e interesses'}
                    value={teenage.friendsInterests}
                    onChange={(friendsInterests) => onTeenageChange({ friendsInterests })}
                    placeholder={wz?.friendsPlaceholder || 'Ex: Apaixonado por futebol, jogava com os amigos...'}
                    rows={3}
                    icon={<Smile className="w-5 h-5" />}
                    enhanceContext="teenage_friends"
                />
                <FormTextArea
                    id="d-teenEvents"
                    label={wz?.memorableEvents || 'Eventos marcantes'}
                    value={teenage.memorableEvents}
                    onChange={(memorableEvents) => onTeenageChange({ memorableEvents })}
                    placeholder={wz?.eventPlaceholder || 'Ex: A formatura, o dia da mudança...'}
                    rows={3}
                    icon={<Trophy className="w-5 h-5" />}
                    enhanceContext="teenage_events"
                />
            </section>

            {/* ====== ADULT LIFE ====== */}
            <section className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-5">
                <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-text-main">{wz?.adultLife || 'Vida Adulta'}</h3>
                    <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'opcional'}</span>
                </div>

                <FormTextArea
                    id="d-career"
                    label={wz?.career || 'Carreira / profissão'}
                    value={adultLife.career}
                    onChange={(career) => onAdultLifeChange({ career })}
                    placeholder={wz?.careerPlaceholder || 'Ex: Trabalhou como professor por 35 anos...'}
                    rows={3}
                    icon={<Briefcase className="w-5 h-5" />}
                    enhanceContext="adultLife_career"
                />
                <FormTextArea
                    id="d-hobbies"
                    label={wz?.hobbiesPassions || 'Hobbies e paixões'}
                    value={adultLife.hobbiesPassions}
                    onChange={(hobbiesPassions) => onAdultLifeChange({ hobbiesPassions })}
                    placeholder={wz?.hobbiesPlaceholder || 'Ex: Adorava jardinagem, café coado e contar piadas...'}
                    rows={2}
                    icon={<Music className="w-5 h-5" />}
                    enhanceContext="adultLife_hobbies"
                />
                <FormTextArea
                    id="d-partner"
                    label={wz?.partner || 'Parceiro(a) de vida'}
                    value={adultLife.partner}
                    onChange={(partner) => onAdultLifeChange({ partner })}
                    placeholder={wz?.partnerPlaceholder || 'Ex: Casou-se com Maria Helena numa manhã de sol...'}
                    rows={3}
                    icon={<Heart className="w-5 h-5" />}
                    enhanceContext="adultLife_partner"
                />
                <FormTextArea
                    id="d-children"
                    label={wz?.children || 'Filhos'}
                    value={adultLife.children}
                    onChange={(children) => onAdultLifeChange({ children })}
                    placeholder={wz?.childrenPlaceholder || 'Ex: Uma filha, Ana Clara. Quando nasceu...'}
                    rows={3}
                    icon={<Baby className="w-5 h-5" />}
                    enhanceContext="adultLife_children"
                />
                <FormTextArea
                    id="d-milestones"
                    label={wz?.milestones || 'Marcos importantes'}
                    value={adultLife.milestones}
                    onChange={(milestones) => onAdultLifeChange({ milestones })}
                    placeholder={wz?.milestonesPlaceholder || 'Ex: Ensinou a filha a andar de bicicleta...'}
                    rows={3}
                    icon={<Trophy className="w-5 h-5" />}
                    enhanceContext="adultLife_milestones"
                />
            </section>

            {/* ====== LATER LIFE ====== */}
            <section className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-5">
                <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-semibold text-text-main">{wz?.laterLife || 'Momento Atual'}</h3>
                    <span className="text-xs text-text-muted ml-auto">{t.common?.optional || 'opcional'}</span>
                </div>

                <FormInput
                    id="d-laterLiving"
                    label={wz?.whereNow || 'Onde mora atualmente?'}
                    value={laterLife.livingPlace}
                    onChange={(livingPlace) => onLaterLifeChange({ livingPlace })}
                    placeholder={wz?.nowLivingPlaceholder || 'Ex: Na mesma casa onde criou os filhos'}
                    icon={<Home className="w-5 h-5" />}
                />
                <FormTextArea
                    id="d-routines"
                    label={wz?.routinesTraditions || 'Rotinas e tradições'}
                    value={laterLife.routinesTraditions}
                    onChange={(routinesTraditions) => onLaterLifeChange({ routinesTraditions })}
                    placeholder={wz?.routinesPlaceholder || 'Ex: Toma café no jardim toda manhã...'}
                    rows={3}
                    icon={<CalendarHeart className="w-5 h-5" />}
                    enhanceContext="laterLife_routines"
                />
                <FormTextArea
                    id="d-familyMoments"
                    label={wz?.familyMoments || 'Momentos em família'}
                    value={laterLife.familyMoments}
                    onChange={(familyMoments) => onLaterLifeChange({ familyMoments })}
                    placeholder={wz?.familyPlaceholder || 'Ex: O último Natal todos juntos...'}
                    rows={3}
                    icon={<Users className="w-5 h-5" />}
                    enhanceContext="laterLife_family"
                />
                <FormTextArea
                    id="d-comfort"
                    label={wz?.comfortJoy || 'O que traz conforto e alegria'}
                    value={laterLife.comfortJoy}
                    onChange={(comfortJoy) => onLaterLifeChange({ comfortJoy })}
                    placeholder={wz?.comfortPlaceholder || 'Ex: A risada dos netos, o cheiro do café...'}
                    rows={3}
                    icon={<HandHeart className="w-5 h-5" />}
                    enhanceContext="laterLife_comfort"
                />
            </section>

            {/* Tip */}
            <p className="text-sm text-text-muted text-center italic">
                {wz?.detailedMemoriesTip || 'Não se preocupe em preencher tudo — cada detalhe que compartilhar torna o livro mais especial.'}
            </p>
        </motion.div>
    );
};
