
export default function Footer() {
  return (
    <footer>
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Taleex. All rights reserved.
        </div>
    </footer>
  )
}
