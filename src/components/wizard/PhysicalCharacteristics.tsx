import { motion } from 'framer-motion';
import { User, Eye, Glasses } from 'lucide-react';
import type { 
    PhysicalCharacteristicsData, 
    SkinColor, 
    HairColor, 
    HairStyle 
} from './types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PhysicalCharacteristicsProps {
    data: PhysicalCharacteristicsData;
    onChange: (data: Partial<PhysicalCharacteristicsData>) => void;
}

export const PhysicalCharacteristics = ({ data, onChange }: PhysicalCharacteristicsProps) => {
    const { t } = useLanguage();
    const pc = t.physicalCharacteristics;

    const skinColors: { value: SkinColor; color: string; label: string }[] = [
        { value: 'light', color: '#FFE4C4', label: pc?.light || 'Claro' },
        { value: 'fair', color: '#F5DEB3', label: pc?.fair || 'Branco' },
        { value: 'medium', color: '#DEB887', label: pc?.medium || 'Médio' },
        { value: 'olive', color: '#C4A484', label: pc?.olive || 'Oliva' },
        { value: 'tan', color: '#B08968', label: pc?.tan || 'Bronzeado' },
        { value: 'brown', color: '#8B6914', label: pc?.brown || 'Marrom' },
        { value: 'dark', color: '#5C4033', label: pc?.dark || 'Escuro' },
    ];

    const hairColors: { value: HairColor; color: string; label: string }[] = [
        { value: 'blonde', color: '#F5DEB3', label: pc?.blonde || 'Loiro' },
        { value: 'golden', color: '#DAA520', label: pc?.golden || 'Dourado' },
        { value: 'brown', color: '#8B4513', label: pc?.brownHair || 'Castanho' },
        { value: 'dark-brown', color: '#3D2314', label: pc?.darkBrown || 'Castanho Escuro' },
        { value: 'black', color: '#1C1C1C', label: pc?.black || 'Preto' },
        { value: 'red', color: '#B7410E', label: pc?.red || 'Ruivo' },
        { value: 'gray', color: '#808080', label: pc?.gray || 'Grisalho' },
        { value: 'white', color: '#F5F5F5', label: pc?.white || 'Branco' },
    ];

    const hairStyles: { value: HairStyle; label: string; icon: string }[] = [
        { value: 'short', label: pc?.short || 'Curto', icon: '💇' },
        { value: 'medium', label: pc?.mediumHair || 'Médio', icon: '👱' },
        { value: 'long', label: pc?.long || 'Longo', icon: '👩‍🦰' },
        { value: 'curly', label: pc?.curly || 'Cacheado', icon: '👩‍🦱' },
        { value: 'wavy', label: pc?.wavy || 'Ondulado', icon: '🙍' },
        { value: 'bald', label: pc?.bald || 'Careca', icon: '👨‍🦲' },
        { value: 'buzz-cut', label: pc?.buzzCut || 'Raspado', icon: '👨' },
        { value: 'ponytail', label: pc?.ponytail || 'Rabo de Cavalo', icon: '👧' },
        { value: 'bun', label: pc?.bun || 'Coque', icon: '👩' },
    ];
    return (
        <div className="space-y-6">
            {/* Name */}
            <div>
                <label className="block text-sm font-semibold text-text-main mb-2">
                    {pc?.personName || 'Nome da pessoa'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        placeholder={pc?.namePlaceholder || "Ex: Vovó Maria"}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-2xl focus:border-primary-teal focus:outline-none transition-colors text-text-main bg-white placeholder:text-text-muted/50"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <User className="w-5 h-5 text-primary-teal" />
                    </div>
                </div>
            </div>

            {/* Gender Selection */}
            <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                    {pc?.gender || 'Gênero'}
                </label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => onChange({ gender: 'male' })}
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            data.gender === 'male'
                                ? 'border-primary-teal bg-primary-teal/10'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            data.gender === 'male' ? 'bg-primary-teal/20' : 'bg-gray-100'
                        }`}>
                            <svg viewBox="0 0 24 24" className={`w-6 h-6 ${data.gender === 'male' ? 'text-primary-teal' : 'text-gray-500'}`} fill="currentColor">
                                <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8zm2 10a3 3 0 00-3 3v1h14v-1a3 3 0 00-3-3H8z" />
                            </svg>
                        </div>
                        <span className={`font-semibold ${data.gender === 'male' ? 'text-primary-teal' : 'text-gray-700'}`}>
                            {pc?.male || 'Masculino'}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onChange({ gender: 'female' })}
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                            data.gender === 'female'
                                ? 'border-accent-coral bg-accent-coral/10'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            data.gender === 'female' ? 'bg-accent-coral/20' : 'bg-gray-100'
                        }`}>
                            <svg viewBox="0 0 24 24" className={`w-6 h-6 ${data.gender === 'female' ? 'text-accent-coral' : 'text-gray-500'}`} fill="currentColor">
                                <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8zm2 10a3 3 0 00-3 3v1h14v-1a3 3 0 00-3-3H8z" />
                            </svg>
                        </div>
                        <span className={`font-semibold ${data.gender === 'female' ? 'text-accent-coral' : 'text-gray-700'}`}>
                            {pc?.female || 'Feminino'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Skin Color */}
            <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                    {pc?.skinColor || 'Cor da Pele'}
                </label>
                <div className="flex flex-wrap gap-3">
                    {skinColors.map((skin) => (
                        <motion.button
                            key={skin.value}
                            type="button"
                            onClick={() => onChange({ skinColor: skin.value })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                                data.skinColor === skin.value
                                    ? 'ring-2 ring-primary-teal ring-offset-2'
                                    : 'hover:bg-gray-50'
                            }`}
                            title={skin.label}
                        >
                            <div
                                className={`w-10 h-10 rounded-full border-2 ${
                                    data.skinColor === skin.value ? 'border-primary-teal' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: skin.color }}
                            />
                            <span className="text-xs text-gray-600">{skin.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Hair Color */}
            <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                    {pc?.hairColor || 'Cor do Cabelo'}
                </label>
                <div className="flex flex-wrap gap-3">
                    {hairColors.map((hair) => (
                        <motion.button
                            key={hair.value}
                            type="button"
                            onClick={() => onChange({ hairColor: hair.value })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                                data.hairColor === hair.value
                                    ? 'ring-2 ring-primary-teal ring-offset-2'
                                    : 'hover:bg-gray-50'
                            }`}
                            title={hair.label}
                        >
                            <div
                                className={`w-10 h-10 rounded-full border-2 ${
                                    data.hairColor === hair.value ? 'border-primary-teal' : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: hair.color }}
                            />
                            <span className="text-xs text-gray-600">{hair.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Hair Style */}
            <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                    {pc?.hairStyle || 'Estilo do Cabelo'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {hairStyles.map((style) => (
                        <motion.button
                            key={style.value}
                            type="button"
                            onClick={() => onChange({ hairStyle: style.value })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                data.hairStyle === style.value
                                    ? 'border-primary-teal bg-primary-teal/10'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-2xl">{style.icon}</span>
                            <span className={`text-xs font-medium ${
                                data.hairStyle === style.value ? 'text-primary-teal' : 'text-gray-600'
                            }`}>
                                {style.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Accessories */}
            <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                    {pc?.accessories || 'Acessórios'}
                </label>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => onChange({ hasGlasses: !data.hasGlasses })}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            data.hasGlasses
                                ? 'border-primary-teal bg-primary-teal/10'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Glasses className={`w-5 h-5 ${data.hasGlasses ? 'text-primary-teal' : 'text-gray-500'}`} />
                        <span className={`font-medium ${data.hasGlasses ? 'text-primary-teal' : 'text-gray-700'}`}>
                            {pc?.wearsGlasses || 'Usa Óculos'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            data.hasGlasses ? 'bg-primary-teal border-primary-teal' : 'border-gray-300'
                        }`}>
                            {data.hasGlasses && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </button>

                    {data.gender === 'male' && (
                        <button
                            type="button"
                            onClick={() => onChange({ hasFacialHair: !data.hasFacialHair })}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                                data.hasFacialHair
                                    ? 'border-primary-teal bg-primary-teal/10'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <Eye className={`w-5 h-5 ${data.hasFacialHair ? 'text-primary-teal' : 'text-gray-500'}`} />
                            <span className={`font-medium ${data.hasFacialHair ? 'text-primary-teal' : 'text-gray-700'}`}>
                                {pc?.facialHair || 'Barba/Bigode'}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                data.hasFacialHair ? 'bg-primary-teal border-primary-teal' : 'border-gray-300'
                            }`}>
                                {data.hasFacialHair && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
