import { useState } from 'react';
import { DashboardNavbar } from '../components/layout/DashboardNavbar';
import { DashboardFooter } from '../components/layout/DashboardFooter';
import { MemoryStoryCard } from '../components/ui/MemoryStoryCard';
import { SuccessNotification } from '../components/ui/SuccessNotification';
import { CreateMemoryBookModal } from '../components/wizard';
import { BookViewer, BookEditor } from '../components/book';
import type { BookPage } from '../components/book';
import { Plus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// Sample book pages for "Grandpa's 80th Birthday"
const grandpaBookPages: BookPage[] = [
    {
        id: 'p1',
        imageUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&h=1000&fit=crop',
        title: "Grandpa's 80th Birthday",
        description: 'The whole family gathered for cake and singing.',
        date: 'July 12, 2023',
    },
    {
        id: 'p2',
        imageUrl: 'https://images.unsplash.com/photo-1529543544277-df48ed28e79e?w=800&h=1000&fit=crop',
        title: 'The Birthday Cake',
        description: 'Grandma made his favorite chocolate cake with 80 candles.',
        date: 'July 12, 2023',
    },
    {
        id: 'p3',
        imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=1000&fit=crop',
        title: 'Family Gathering',
        description: 'Three generations came together to celebrate.',
        date: 'July 12, 2023',
    },
    {
        id: 'p4',
        imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c0651?w=800&h=1000&fit=crop',
        title: 'Opening Presents',
        description: 'The kids helped grandpa unwrap his gifts.',
        date: 'July 12, 2023',
    },
    {
        id: 'p5',
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=1000&fit=crop',
        title: 'Story Time',
        description: 'Grandpa told his favorite story about the old house.',
        date: 'July 12, 2023',
    },
    {
        id: 'p6',
        imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=1000&fit=crop',
        title: 'Dancing Together',
        description: 'Grandpa and grandma danced to their wedding song.',
        date: 'July 12, 2023',
    },
    {
        id: 'p7',
        imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=1000&fit=crop',
        title: 'Group Photo',
        description: 'Everyone gathered for the perfect family picture.',
        date: 'July 12, 2023',
    },
    {
        id: 'p8',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1000&fit=crop',
        title: 'The Feast',
        description: 'A delicious spread of all his favorite dishes.',
        date: 'July 12, 2023',
    },
    {
        id: 'p9',
        imageUrl: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=800&h=1000&fit=crop',
        title: 'Precious Moments',
        description: 'Quiet moments of reflection and gratitude.',
        date: 'July 12, 2023',
    },
    {
        id: 'p10',
        imageUrl: 'https://images.unsplash.com/photo-1529543544277-df48ed28e79e?w=800&h=1000&fit=crop',
        title: 'Forever Memories',
        description: 'A day we will never forget.',
        date: 'July 12, 2023',
    },
];

// Sample data for memory books
const sampleMemoryBooks = [
    {
        id: '1',
        title: "Grandpa's 80th Birthday",
        date: 'July 12, 2023',
        description: 'The whole family gathered for cake and singing. Grandpa told his favorite story about the old house.',
        imageUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&h=300&fit=crop',
        isFavorite: true,
        pageCount: 10,
        pages: grandpaBookPages,
    },
    {
        id: '2',
        title: 'Summer at the Lake',
        date: 'June 2022',
        description: 'The water was sparkling and the air was fresh. We spent all day fishing and swimming in the clear blue water.',
        imageUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
        isFavorite: false,
        pageCount: 15,
        pages: grandpaBookPages.slice(0, 15),
    },
    {
        id: '3',
        title: 'Baking with Mom',
        date: 'October 15, 2023',
        description: 'Making the secret family apple pie recipe together. The kitchen smelled like cinnamon all afternoon.',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        isFavorite: false,
        pageCount: 10,
        pages: grandpaBookPages.slice(0, 10),
    },
    {
        id: '4',
        title: 'Our First Garden',
        date: 'May 2021',
        description: 'The roses were in full bloom this year. We spent every morning watering them before the heat set in.',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop',
        isFavorite: false,
        pageCount: 20,
        pages: grandpaBookPages,
    },
    {
        id: '5',
        title: 'Sunday Morning Coffee',
        date: 'September 2023',
        description: 'Enjoying the quiet morning sun on the porch with a fresh brew. This was the memory just added.',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
        isFavorite: true,
        pageCount: 10,
        pages: grandpaBookPages.slice(0, 10),
    },
    {
        id: '6',
        title: 'Holiday Dinner 2023',
        date: 'December 25, 2023',
        description: 'A beautiful evening filled with laughter and joy. We all stayed up late playing board games.',
        imageUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&h=300&fit=crop',
        isFavorite: false,
        pageCount: 15,
        pages: grandpaBookPages.slice(0, 15),
    },
];

export const Dashboard = () => {
    const [showNotification, setShowNotification] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<typeof sampleMemoryBooks[0] | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [bookPages, setBookPages] = useState<BookPage[]>([]);

    const handleOpenBook = (book: typeof sampleMemoryBooks[0]) => {
        setSelectedBook(book);
        setBookPages(book.pages);
        setIsViewerOpen(true);
    };

    const handleEditBook = (book: typeof sampleMemoryBooks[0]) => {
        setSelectedBook(book);
        setBookPages(book.pages);
        setIsEditorOpen(true);
    };

    const handlePrintBook = (book: typeof sampleMemoryBooks[0]) => {
        // In a real app, this would generate a PDF
        console.log('Printing book:', book.title);
        alert(`Downloading "${book.title}" as PDF...`);
    };

    const handleDeleteBook = (book: typeof sampleMemoryBooks[0]) => {
        // In a real app, this would delete the book
        if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
            console.log('Deleting book:', book.title);
        }
    };

    const handleSavePages = (pages: BookPage[]) => {
        setBookPages(pages);
        console.log('Saved pages:', pages);
    };

    return (
        <div className="min-h-screen bg-bg-soft flex flex-col">
            <DashboardNavbar userName="Maria" />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Success Notification */}
                <SuccessNotification
                    isVisible={showNotification}
                    title="Memory successfully added!"
                    message='Your latest memory "Sunday Morning Coffee" has been saved to the album.'
                    onClose={() => setShowNotification(false)}
                    onViewDetails={() => console.log('View details')}
                />

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-2">
                        Our Family Album
                    </h1>
                    <p className="text-text-muted text-lg">
                        A gentle collection of your favorite moments and stories.
                    </p>
                </div>

                {/* Recent Stories Section */}
                <section>
                    <h2 className="text-2xl font-bold text-text-main mb-6">My Memory Books</h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {sampleMemoryBooks.map((book, index) => (
                            <motion.div
                                key={book.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <MemoryStoryCard
                                    id={book.id}
                                    title={book.title}
                                    date={book.date}
                                    description={book.description}
                                    imageUrl={book.imageUrl}
                                    isFavorite={book.isFavorite}
                                    pageCount={book.pageCount}
                                    onClick={() => handleOpenBook(book)}
                                    onEdit={() => handleEditBook(book)}
                                    onPrint={() => handlePrintBook(book)}
                                    onDelete={() => handleDeleteBook(book)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Empty State / Create New Book CTA */}
                <section className="mt-16 mb-8">
                    <div className="bg-gradient-to-br from-primary-teal/5 to-accent-coral/5 rounded-3xl border border-primary-teal/20 p-8 md:p-12 text-center">
                        <div className="max-w-xl mx-auto">
                            <div className="w-16 h-16 bg-primary-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-8 h-8 text-primary-teal" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-text-main mb-3">
                                Create New Memory Book
                            </h3>
                            <p className="text-text-muted mb-8">
                                Start a new collection of precious moments. Perfect for special occasions, 
                                family milestones, or everyday treasures.
                            </p>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] text-white rounded-xl font-semibold hover:from-[#00d4d4] hover:to-[#ff8f80] transition-all shadow-lg shadow-primary-teal/20 hover:shadow-xl hover:shadow-primary-teal/30"
                            >
                                <Plus className="w-5 h-5" />
                                Create New Memory Book
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <DashboardFooter />

            {/* Create Memory Book Modal */}
            <CreateMemoryBookModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onComplete={(data) => {
                    console.log('Memory Book created:', data);
                    setIsCreateModalOpen(false);
                }}
            />

            {/* Book Viewer */}
            {selectedBook && (
                <BookViewer
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setSelectedBook(null);
                    }}
                    title={selectedBook.title}
                    pages={bookPages}
                    isFavorite={selectedBook.isFavorite}
                    onToggleFavorite={() => console.log('Toggle favorite')}
                    onEdit={() => {
                        setIsViewerOpen(false);
                        setIsEditorOpen(true);
                    }}
                    onPrint={() => handlePrintBook(selectedBook)}
                    onDelete={() => {
                        handleDeleteBook(selectedBook);
                        setIsViewerOpen(false);
                        setSelectedBook(null);
                    }}
                    onPageEdit={(pageIndex) => {
                        console.log('Edit page:', pageIndex);
                        setIsViewerOpen(false);
                        setIsEditorOpen(true);
                    }}
                />
            )}

            {/* Book Editor */}
            {selectedBook && (
                <BookEditor
                    isOpen={isEditorOpen}
                    onClose={() => {
                        setIsEditorOpen(false);
                        setSelectedBook(null);
                    }}
                    title={selectedBook.title}
                    pages={bookPages}
                    onSave={handleSavePages}
                />
            )}
        </div>
    );
};
