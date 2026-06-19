Now I have the complete picture. Let me plan all fixes precisely:

Issues:

headerStyle only wired in Navy — need a shared HeaderBlock used by all 6 resume templates + all 6 CL templates
accentColor2 never actually used anywhere in templates (only extracted)
showPhoto only on Sidebar/Executive (resume) and Sidebar/Executive (CL) — Serif, Tech, ATS, Navy need small photo option too
Template picker — the chip strip applies immediately without preview. The TemplatePicker fullscreen carousel IS correct, but the user doesn't discover it. The chip clicking should open the TemplatePicker at that template's position instead of applying directly
Let me now write all the fixes:

Update Todos

Create shared TemplateHeader component used by all resume+CL templates

Add accentColor2 usage to skill tags + badges across templates

Add photo slot to Serif/Tech/ATS Navy templates (all 6 resume, all 6 CL)

Make sidebar chip click open TemplatePicker at that index for preview-before-apply

Update tests and run build+lint+tests