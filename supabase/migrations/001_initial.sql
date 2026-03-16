-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'))
);

-- Create recipes table
CREATE TABLE public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    prep_time TEXT,
    cook_time TEXT,
    servings INTEGER,
    source TEXT,
    source_url TEXT,
    photo_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ingredients table
CREATE TABLE public.ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    amount TEXT,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

-- Create steps table
CREATE TABLE public.steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    time_label TEXT,
    order_index INTEGER NOT NULL
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Users can view their own recipes" ON public.recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

-- Ingredients policies (inherit from recipe)
CREATE POLICY "Users can view ingredients of their recipes" ON public.ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.ingredients.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert ingredients to their recipes" ON public.ingredients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.ingredients.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update ingredients of their recipes" ON public.ingredients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.ingredients.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete ingredients of their recipes" ON public.ingredients FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.ingredients.recipe_id AND user_id = auth.uid()));

-- Steps policies (inherit from recipe)
CREATE POLICY "Users can view steps of their recipes" ON public.steps FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.steps.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert steps to their recipes" ON public.steps FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.steps.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update steps of their recipes" ON public.steps FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.steps.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete steps of their recipes" ON public.steps FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.steps.recipe_id AND user_id = auth.uid()));

-- Comments policies (inherit from recipe/user)
CREATE POLICY "Users can view comments on their recipes" ON public.comments FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = public.comments.recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert comments on their recipes" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for recipe photos
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-photos', 'recipe-photos', true);

-- Storage bucket policies
CREATE POLICY "Users can upload their own recipe photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-photos' AND auth.uid() = owner);
CREATE POLICY "Users can view recipe photos" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-photos');
CREATE POLICY "Users can delete their own recipe photos" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-photos' AND auth.uid() = owner);
