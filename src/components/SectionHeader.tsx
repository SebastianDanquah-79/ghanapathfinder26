import { motion } from "framer-motion";

interface SectionHeaderProps {
  badge: string;
  title: string;
  highlight?: string;
  description: string;
}

const SectionHeader = ({ badge, title, highlight, description }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-7 lg:mb-9"
  >
    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
      {badge}
    </span>
    <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl mb-3">
      {title}{" "}
      {highlight && <span className="text-gradient-gold">{highlight}</span>}
    </h2>
    <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
  </motion.div>
);

export default SectionHeader;
